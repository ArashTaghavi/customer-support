<?php

use App\Models\Order\Order;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ProductCategorySeeder;
use Database\Seeders\ProductModelSeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('default seeds import photos and display models into the four required categories', function () {
    Storage::fake('public');
    $firstUser = User::factory()->create();
    $secondUser = User::factory()->create();

    $this->seed(DatabaseSeeder::class);

    $this->assertDatabaseCount('product_categories', 4);
    $this->assertDatabaseCount('products', 196);
    $this->assertDatabaseCount('users', 2);
    $this->assertDatabaseCount('orders', 20);
    expect($firstUser->orders()->count())->toBe(20);
    expect($secondUser->orders()->count())->toBe(0);
    foreach (Order::with(['orderItems.product', 'payments'])->get() as $order) {
        expect($order->orderItems)->not->toBeEmpty();
        expect($order->total_amount)->toBe($order->orderItems->sum('total_price'));
        expect($order->payments)->toHaveCount(1);
        expect($order->payments->first()->amount)->toBe($order->total_amount);
        foreach ($order->orderItems as $item) {
            expect($item->product->image)->not->toBeEmpty();
            expect($item->total_price)->toBe($item->unit_price * $item->quantity);
        }
    }
    foreach (['Phone' => [40, 11], 'Laptop' => [35, 19], 'Gaming' => [29, 15], 'Accessories' => [26, 21]] as $title => [$photos, $models]) {
        $category = ProductCategory::where('title', $title)->firstOrFail();
        $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'product_count' => $photos + $models]);
        expect($category->products()->whereNotNull('image')->count())->toBe($photos);
        expect($category->products()->whereNotNull('model_file')->count())->toBe($models);
    }
    $this->assertDatabaseHas('products', ['title' => 'Apple iPhone 16', 'price' => 69000000, 'stock' => 5, 'image' => 'products/apple-iphone-16.jpg', 'model_file' => null]);
    $this->assertDatabaseHas('products', ['title' => 'Tower Console', 'image' => null]);
    $this->assertDatabaseHas('products', ['title' => 'USB Wall Charger', 'image' => null]);
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('showroomTables.0.products', 11)
        ->has('showroomTables.0.catalog_products', 40)
        ->has('showroomTables.1.products', 19)
        ->has('showroomTables.1.catalog_products', 35)
        ->where('showroomTables.2.slot', 'gaming')
        ->has('showroomTables.2.products', 15)
        ->has('showroomTables.2.catalog_products', 29)
        ->where('showroomTables.3.slot', 'accessories')
        ->has('showroomTables.3.products', 21)
        ->has('showroomTables.3.catalog_products', 26));
});

test('photo seeding can run alone and repeatedly without overwriting edited product data', function () {
    $this->seed(ProductSeeder::class);
    $product = Product::where('image', 'products/apple-iphone-16.jpg')->firstOrFail();
    $product->update(['price' => 71000000, 'stock' => 2]);

    $this->seed(ProductSeeder::class);

    $this->assertDatabaseCount('products', 130);
    $this->assertDatabaseCount('product_categories', 4);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 71000000, 'stock' => 2]);
});

test('category seeding merges legacy names and assignments without losing products', function () {
    $canonical = ProductCategory::factory()->create(['title' => 'Phone']);
    $legacy = ProductCategory::factory()->create(['title' => 'Mobile and Tablets', 'showroom_slot' => 'phone']);
    $headphones = ProductCategory::factory()->create(['title' => 'headphone', 'showroom_slot' => 'headphone']);
    $product = Product::factory()->create(['product_category_id' => $legacy->id]);
    $headset = Product::factory()->create(['product_category_id' => $headphones->id]);

    $this->seed(ProductCategorySeeder::class);
    $this->seed(ProductCategorySeeder::class);

    expect(ProductCategory::count())->toBe(4);
    $this->assertDatabaseHas('product_categories', ['id' => $canonical->id, 'title' => 'Phone', 'showroom_slot' => 'phone', 'product_count' => 1]);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'product_category_id' => $canonical->id]);
    $this->assertDatabaseHas('product_categories', ['id' => $headphones->id, 'title' => 'Accessories', 'showroom_slot' => 'accessories', 'product_count' => 1]);
    $this->assertDatabaseHas('products', ['id' => $headset->id, 'product_category_id' => $headphones->id]);
    $this->assertSoftDeleted($legacy);
});

test('seeds restore deleted seed records instead of creating duplicate photos or models', function () {
    Storage::fake('public');
    $this->seed([ProductSeeder::class, ProductModelSeeder::class]);
    $photo = Product::where('image', 'products/apple-iphone-16.jpg')->firstOrFail();
    $model = Product::where('model_file', 'products/models/showroom/tower-console.glb')->firstOrFail();
    $category = ProductCategory::where('title', 'Gaming')->firstOrFail();
    $photo->delete();
    $model->delete();
    $category->delete();

    $this->seed([ProductSeeder::class, ProductModelSeeder::class]);

    $this->assertDatabaseCount('products', 196);
    $this->assertDatabaseCount('product_categories', 4);
    $this->assertDatabaseHas('products', ['id' => $photo->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('products', ['id' => $model->id, 'product_category_id' => $category->id, 'deleted_at' => null]);
    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'product_count' => 44, 'deleted_at' => null]);
});
