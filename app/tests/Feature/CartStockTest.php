<?php

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('showroom cart additions and removals keep shared quantities in sync without reserving warehouse stock', function () {
    $user = User::factory()->create();
    $category = ProductCategory::factory()->create(['showroom_slot' => 'phone']);
    $product = Product::factory()->create(['product_category_id' => $category->id, 'image' => 'products/phone.jpg', 'stock' => 2]);
    $this->actingAs($user);

    $this->from(route('shop'))->post(route('cart.add', $product->id))->assertRedirect(route('shop'))->assertSessionHasNoErrors();
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('cart', 1)
        ->where('cart.0.product.id', $product->id)
        ->where('cart.0.quantity', 1)
        ->where('showroomTables.0.catalog_products.0.stock', 2));
    $this->from(route('shop'))->post(route('cart.add', $product->id))->assertRedirect(route('shop'))->assertSessionHasNoErrors();
    $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 2]);
    $this->from(route('shop'))->post(route('cart.remove', $product->id))->assertRedirect(route('shop'));
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page->where('cart.0.quantity', 1));
    $this->from(route('shop'))->post(route('cart.remove', $product->id))->assertRedirect(route('shop'));
    $this->get(route('shop'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('cart', 0));
    $this->assertDatabaseMissing('cart_items', ['product_id' => $product->id]);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 2]);
});

test('adding more than the current stock is rejected and removing an item allows adding it again', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 1]);
    $user->cart()->create()->cartItems()->create(['product_id' => $product->id, 'quantity' => 1]);
    $this->actingAs($user);

    $this->from(route('shop'))->post(route('cart.add', $product->id))
        ->assertRedirect(route('shop'))
        ->assertSessionHasErrors(['cart' => 'The requested quantity exceeds available stock.']);

    $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 1]);
    $this->post(route('cart.remove', $product->id))->assertRedirect();
    $this->post(route('cart.add', $product->id))->assertRedirect()->assertSessionHasNoErrors();
    $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 1]);
});

test('out of stock products cannot create a cart or cart item', function () {
    $this->actingAs(User::factory()->create());
    $product = Product::factory()->create(['stock' => 0]);

    $this->from(route('shop'))->post(route('cart.add', $product->id))
        ->assertRedirect(route('shop'))
        ->assertSessionHasErrors(['cart' => 'The requested quantity exceeds available stock.']);

    $this->assertDatabaseCount('carts', 0);
    $this->assertDatabaseCount('cart_items', 0);
});

test('deleted products cannot be added to the cart', function () {
    $this->actingAs(User::factory()->create());
    $product = Product::factory()->create();
    $product->delete();

    $this->post(route('cart.add', $product->id))->assertNotFound();

    $this->assertDatabaseCount('cart_items', 0);
});

test('cart stock limits are based on the current user cart', function () {
    $other = User::factory()->create();
    $current = User::factory()->create();
    $product = Product::factory()->create(['stock' => 1]);
    $other->cart()->create()->cartItems()->create(['product_id' => $product->id, 'quantity' => 1]);
    $this->actingAs($current);

    $this->post(route('cart.add', $product->id))->assertRedirect()->assertSessionHasNoErrors();

    expect($other->cartItems()->firstOrFail()->quantity)->toBe(1);
    expect($current->cartItems()->firstOrFail()->quantity)->toBe(1);
    $this->assertDatabaseCount('cart_items', 2);
});

test('guests must sign in before modifying the cart', function () {
    $product = Product::factory()->create();

    $this->post(route('cart.add', $product->id))->assertRedirect(route('login'));

    $this->assertDatabaseCount('cart_items', 0);
});
