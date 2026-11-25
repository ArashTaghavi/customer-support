<?php

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Database\Seeders\ShowroomSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('showroom seed creates three assigned categories and copies ten real glb products', function () {
    Storage::fake('public');
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseCount('product_categories', 3);
    $this->assertDatabaseCount('products', 10);
    foreach (['phone' => 3, 'laptop' => 3, 'headphone' => 4] as $slot => $count) {
        $this->assertDatabaseHas('product_categories', ['title' => $slot, 'showroom_slot' => $slot, 'product_count' => $count]);
    }
    foreach (Product::all() as $product) {
        Storage::disk('public')->assertExists($product->model_file);
        expect($product->model_file)->toEndWith('.glb');
        expect(hash('sha256', Storage::disk('public')->get($product->model_file)))
            ->toBe(hash_file('sha256', public_path('models/showroom/'.basename($product->model_file))));
    }
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseCount('products', 10);
    $this->assertDatabaseCount('product_categories', 3);
});

test('showroom seed keeps edited prices and category titles on repeat runs', function () {
    Storage::fake('public');
    $this->seed(ShowroomSeeder::class);
    $product = Product::firstOrFail();
    $product->update(['price' => 125000, 'stock' => 9]);
    ProductCategory::where('showroom_slot', 'phone')->update(['title' => 'Phones and tablets']);
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 125000, 'stock' => 9]);
    $this->assertDatabaseHas('product_categories', ['showroom_slot' => 'phone', 'title' => 'Phones and tablets']);
    $this->assertDatabaseCount('product_categories', 3);
});

test('three showroom tables include database products independently of the legacy product page', function () {
    $phone = ProductCategory::factory()->create(['title' => 'Phones', 'showroom_slot' => 'phone']);
    $laptop = ProductCategory::factory()->create(['title' => 'Laptops', 'showroom_slot' => 'laptop']);
    Product::factory()->count(15)->create(['product_category_id' => $phone->id, 'model_file' => 'products/models/test.glb']);
    $newest = Product::factory()->create(['title' => 'Newest phone', 'product_category_id' => $phone->id, 'model_file' => 'products/models/new.glb']);
    $computer = Product::factory()->create(['product_category_id' => $laptop->id, 'model_file' => 'products/models/laptop.glb']);
    Product::factory()->create(['product_category_id' => $phone->id, 'model_file' => null]);
    $removed = Product::factory()->create(['product_category_id' => $phone->id, 'model_file' => 'products/models/deleted.glb']);
    $removed->delete();
    $this->get(route('shop', ['category' => $laptop->id]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('site/shop/index')
        ->has('showroomTables', 3)
        ->where('showroomTables.0.slot', 'phone')
        ->where('showroomTables.0.category.id', $phone->id)
        ->has('showroomTables.0.products', 16)
        ->where('showroomTables.0.products.0.id', $newest->id)
        ->where('showroomTables.0.products.0.model_url', asset('products/models/new.glb'))
        ->has('showroomTables.1.products', 1)
        ->where('showroomTables.1.products.0.id', $computer->id)
        ->where('showroomTables.2.category', null)
        ->has('showroomTables.2.products', 0));
});

test('an empty catalog has empty tables with no static demo fallback', function () {
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables', 3)
        ->has('showroomTables.0.products', 0)
        ->has('showroomTables.1.products', 0)
        ->has('showroomTables.2.products', 0));
});

test('category table assignments are editable unique and survive category renames', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create(['title' => 'Phones', 'showroom_slot' => 'phone']);
    $this->put(route('admin.product-categories.update', $category), ['title' => 'Mobile devices', 'showroom_slot' => 'phone'])
        ->assertRedirectToRoute('admin.product-categories.index');
    $this->post(route('admin.product-categories.store'), ['title' => 'Duplicate table', 'showroom_slot' => 'phone'])->assertSessionHasErrors('showroom_slot');
    $this->post(route('admin.product-categories.store'), ['title' => 'Invalid table', 'showroom_slot' => 'room'])->assertSessionHasErrors('showroom_slot');
    $this->get(route('shop'))->assertInertia(fn (Assert $page) => $page->where('showroomTables.0.category.title', 'Mobile devices'));
    $this->put(route('admin.product-categories.update', $category), ['title' => 'Mobile devices', 'showroom_slot' => 'laptop'])->assertRedirectToRoute('admin.product-categories.index');
    $this->get(route('shop'))->assertInertia(fn (Assert $page) => $page->where('showroomTables.0.category', null)->where('showroomTables.1.category.id', $category->id));
});

test('deleting an empty category releases its table for another category', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create(['title' => 'Phones', 'showroom_slot' => 'phone']);
    $this->delete(route('admin.product-categories.destroy', $category))->assertRedirectToRoute('admin.product-categories.index');
    $this->post(route('admin.product-categories.store'), ['title' => 'Replacement', 'showroom_slot' => 'phone'])->assertRedirectToRoute('admin.product-categories.index');
    $this->get(route('shop'))->assertInertia(fn (Assert $page) => $page->where('showroomTables.0.category.title', 'Replacement'));
});
