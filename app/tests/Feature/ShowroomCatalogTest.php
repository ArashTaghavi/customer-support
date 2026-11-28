<?php

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Database\Seeders\ShowroomSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('showroom seed creates four catalog categories and copies sixty-six real glb products', function () {
    Storage::fake('public');
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseCount('product_categories', 4);
    $this->assertDatabaseCount('products', 66);
    foreach (['Phone' => 11, 'Laptop' => 19, 'Gaming' => 15, 'Accessories' => 21] as $title => $count) {
        $this->assertDatabaseHas('product_categories', ['title' => $title, 'product_count' => $count]);
    }
    foreach (Product::all() as $product) {
        Storage::disk('public')->assertExists($product->model_file);
        expect($product->model_file)->toEndWith('.glb');
        expect(hash('sha256', Storage::disk('public')->get($product->model_file)))
            ->toBe(hash_file('sha256', public_path('models/showroom/'.basename($product->model_file))));
    }
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseCount('products', 66);
    $this->assertDatabaseCount('product_categories', 4);
});

test('showroom seed keeps edited prices and restores required category titles on repeat runs', function () {
    Storage::fake('public');
    $this->seed(ShowroomSeeder::class);
    $product = Product::firstOrFail();
    $product->update(['price' => 125000, 'stock' => 9, 'showroom_order' => 2]);
    ProductCategory::where('showroom_slot', 'phone')->update(['title' => 'Phones and tablets']);
    $this->seed(ShowroomSeeder::class);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 125000, 'stock' => 9, 'showroom_order' => 2]);
    $this->assertDatabaseHas('product_categories', ['showroom_slot' => 'phone', 'title' => 'Phone']);
    $this->assertDatabaseCount('product_categories', 4);
});

test('four showroom tables include database products independently of the legacy product page', function () {
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
        ->has('showroomTables', 4)
        ->where('showroomTables.0.slot', 'phone')
        ->where('showroomTables.0.category.id', $phone->id)
        ->has('showroomTables.0.products', 16)
        ->where('showroomTables.0.products.0.id', $newest->id)
        ->where('showroomTables.0.products.0.model_url', asset('products/models/new.glb'))
        ->has('showroomTables.1.products', 1)
        ->where('showroomTables.1.products.0.id', $computer->id)
        ->where('showroomTables.2.category', null)
        ->has('showroomTables.2.products', 0)
        ->has('showroomTables.3.products', 0));
});

test('an empty catalog has empty tables with no static demo fallback', function () {
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables', 4)
        ->has('showroomTables.0.products', 0)
        ->has('showroomTables.1.products', 0)
        ->has('showroomTables.2.products', 0)
        ->has('showroomTables.0.catalog_products', 0)
        ->has('showroomTables.1.catalog_products', 0)
        ->has('showroomTables.2.catalog_products', 0)
        ->has('showroomTables.3.products', 0)
        ->has('showroomTables.3.catalog_products', 0));
});

test('category modals contain photo products independently of table models', function () {
    $phone = ProductCategory::factory()->create(['showroom_slot' => 'phone']);
    $laptop = ProductCategory::factory()->create(['showroom_slot' => 'laptop']);
    $model = Product::factory()->create(['product_category_id' => $phone->id, 'model_file' => 'products/models/phone.glb', 'image' => null]);
    $photo = Product::factory()->create(['product_category_id' => $phone->id, 'model_file' => null, 'image' => 'products/phone.jpg']);
    $both = Product::factory()->create(['product_category_id' => $phone->id, 'model_file' => 'products/models/both.glb', 'image' => 'products/both.jpg']);
    Product::factory()->create(['product_category_id' => $phone->id, 'image' => '']);
    Product::factory()->create(['product_category_id' => $phone->id, 'image' => '   ']);
    $deleted = Product::factory()->create(['product_category_id' => $phone->id, 'image' => 'products/deleted.jpg']);
    $deleted->delete();
    $computer = Product::factory()->create(['product_category_id' => $laptop->id, 'image' => 'products/laptop.jpg']);

    $this->get(route('shop', ['category' => $laptop->id]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables.0.products', 2)
        ->where('showroomTables.0.products.0.id', $both->id)
        ->where('showroomTables.0.products.1.id', $model->id)
        ->has('showroomTables.0.catalog_products', 2)
        ->where('showroomTables.0.catalog_products.0.id', $both->id)
        ->where('showroomTables.0.catalog_products.1.id', $photo->id)
        ->where('showroomTables.0.catalog_products.1.image_url', asset('products/phone.jpg'))
        ->where('showroomTables.0.catalog_products.1.model_url', null)
        ->has('showroomTables.1.products', 0)
        ->has('showroomTables.1.catalog_products', 1)
        ->where('showroomTables.1.catalog_products.0.id', $computer->id)
        ->has('showroomTables.2.catalog_products', 0));
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

test('existing three-table seed data maps gaming and accessories to their own tables without reseeding', function () {
    $gaming = ProductCategory::factory()->create(['title' => 'Gaming', 'showroom_slot' => null]);
    $accessories = ProductCategory::factory()->create(['title' => 'Accessories', 'showroom_slot' => 'headphone']);
    $console = Product::factory()->create(['product_category_id' => $gaming->id, 'model_file' => 'products/models/console.glb']);
    $charger = Product::factory()->create(['product_category_id' => $accessories->id, 'image' => 'products/charger.jpg']);

    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables', 4)
        ->where('showroomTables.2.slot', 'gaming')
        ->where('showroomTables.2.category.id', $gaming->id)
        ->where('showroomTables.2.category.showroom_slot', 'gaming')
        ->where('showroomTables.2.products.0.id', $console->id)
        ->where('showroomTables.3.slot', 'accessories')
        ->where('showroomTables.3.category.id', $accessories->id)
        ->where('showroomTables.3.category.showroom_slot', 'accessories')
        ->where('showroomTables.3.catalog_products.0.id', $charger->id));
});

test('gaming and accessories tables can be assigned through category management', function (string $slot) {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();

    $this->put(route('admin.product-categories.update', $category), ['title' => 'Updated category', 'showroom_slot' => $slot])
        ->assertRedirectToRoute('admin.product-categories.index');

    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'showroom_slot' => $slot]);
})->with(['gaming', 'accessories']);
