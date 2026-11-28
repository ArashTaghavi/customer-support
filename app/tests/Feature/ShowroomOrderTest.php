<?php

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('table models follow manual order with deterministic ties and automatic models at the end', function () {
    $category = ProductCategory::factory()->create(['showroom_slot' => 'phone']);
    $oldAutomatic = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/old.glb']);
    $second = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/second.glb', 'showroom_order' => 2]);
    $firstOld = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/first-old.glb', 'showroom_order' => 1]);
    $firstNew = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/first-new.glb', 'showroom_order' => 1]);
    $newAutomatic = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/new.glb']);
    $third = Product::factory()->create(['product_category_id' => $category->id, 'model_file' => 'products/third.glb', 'showroom_order' => 3]);
    $photoFirst = Product::factory()->create(['product_category_id' => $category->id, 'image' => 'products/photo-first.jpg', 'showroom_order' => 1]);
    $photoLast = Product::factory()->create(['product_category_id' => $category->id, 'image' => 'products/photo-last.jpg', 'showroom_order' => 99]);
    $other = ProductCategory::factory()->create(['showroom_slot' => 'gaming']);
    $otherProduct = Product::factory()->create(['product_category_id' => $other->id, 'model_file' => 'products/other.glb', 'showroom_order' => 1]);

    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables.0.products', 6)
        ->where('showroomTables.0.products.0.id', $firstNew->id)
        ->where('showroomTables.0.products.1.id', $firstOld->id)
        ->where('showroomTables.0.products.2.id', $second->id)
        ->where('showroomTables.0.products.3.id', $third->id)
        ->where('showroomTables.0.products.4.id', $newAutomatic->id)
        ->where('showroomTables.0.products.5.id', $oldAutomatic->id)
        ->has('showroomTables.0.catalog_products', 2)
        ->where('showroomTables.0.catalog_products.0.id', $photoLast->id)
        ->where('showroomTables.0.catalog_products.1.id', $photoFirst->id)
        ->has('showroomTables.2.products', 1)
        ->where('showroomTables.2.products.0.id', $otherProduct->id));
});

test('catalog management can create edit preserve and clear a model display order', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $data = ['title' => 'Ordered model', 'price' => 0, 'stock' => 1, 'product_category_id' => $category->id];

    $this->post(route('admin.products.store'), [...$data, 'showroom_order' => '3'])->assertRedirectToRoute('admin.products.index')->assertSessionHasNoErrors();
    $product = Product::firstOrFail();
    $this->assertDatabaseHas('products', ['id' => $product->id, 'showroom_order' => 3]);
    $this->get(route('admin.products.edit', $product))->assertOk()->assertInertia(fn (Assert $page) => $page->where('product.showroom_order', 3));
    $this->put(route('admin.products.update', $product), [...$data, 'showroom_order' => 1])->assertRedirectToRoute('admin.products.index')->assertSessionHasNoErrors();
    $this->assertDatabaseHas('products', ['id' => $product->id, 'showroom_order' => 1]);
    $this->put(route('admin.products.update', $product), $data)->assertRedirectToRoute('admin.products.index')->assertSessionHasNoErrors();
    $this->assertDatabaseHas('products', ['id' => $product->id, 'showroom_order' => 1]);
    $this->put(route('admin.products.update', $product), [...$data, 'showroom_order' => ''])->assertRedirectToRoute('admin.products.index')->assertSessionHasNoErrors();
    $this->assertDatabaseHas('products', ['id' => $product->id, 'showroom_order' => null]);
});

test('invalid display orders cannot overwrite the saved order', function (mixed $order) {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['product_category_id' => $category->id, 'showroom_order' => 3]);

    $this->put(route('admin.products.update', $product), ['title' => 'Model', 'price' => 0, 'stock' => 1, 'product_category_id' => $category->id, 'showroom_order' => $order])
        ->assertSessionHasErrors('showroom_order');

    $this->assertDatabaseHas('products', ['id' => $product->id, 'showroom_order' => 3]);
})->with([-1, 0, 1.5, 'first', 2147483648]);
