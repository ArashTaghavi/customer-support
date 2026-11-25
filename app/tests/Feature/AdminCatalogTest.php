<?php

use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function catalogGlb(string $name = 'model.glb', array $extra = []): UploadedFile
{
    $json = json_encode(array_merge(['asset' => ['version' => '2.0'], 'scenes' => [[]]], $extra));
    $json .= str_repeat(' ', (4 - strlen($json) % 4) % 4);

    return UploadedFile::fake()->createWithContent($name, pack('a4VVVV', 'glTF', 2, 20 + strlen($json), strlen($json), 0x4E4F534A).$json);
}
function catalogProductData(ProductCategory $category, array $extra = []): array
{
    return array_merge(['title' => 'Studio headset', 'price' => 100000, 'stock' => 5, 'description' => 'A product.', 'product_category_id' => $category->id], $extra);
}

test('guests cannot access catalog management', function (string $method, string $path) {
    $this->{$method}($path)->assertRedirectToRoute('login');
})->with([
    ['get', '/admin'], ['get', '/admin/products'], ['get', '/admin/products/create'],
    ['post', '/admin/products'], ['put', '/admin/products/1'], ['delete', '/admin/products/1'],
    ['get', '/admin/product-categories'], ['get', '/admin/product-categories/create'],
    ['post', '/admin/product-categories'], ['put', '/admin/product-categories/1'], ['delete', '/admin/product-categories/1'],
]);

test('an ordinary signed in user can create update and delete categories', function () {
    $this->actingAs(User::factory()->create());
    $this->post(route('admin.product-categories.store'), ['title' => '  Audio  ', 'product_count' => 999])->assertRedirectToRoute('admin.product-categories.index');
    $category = ProductCategory::where('title', 'Audio')->firstOrFail();
    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'product_count' => 0]);
    $this->get(route('admin.product-categories.edit', $category))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/product_categories/form')->where('category.id', $category->id));
    $this->put(route('admin.product-categories.update', $category), ['title' => 'Audio'])->assertRedirectToRoute('admin.product-categories.index');
    $this->put(route('admin.product-categories.update', $category), ['title' => 'Studio'])->assertRedirectToRoute('admin.product-categories.index');
    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'title' => 'Studio']);
    $this->delete(route('admin.product-categories.destroy', $category))->assertRedirectToRoute('admin.product-categories.index');
    $this->assertSoftDeleted($category);
});

test('categories with products cannot be deleted and titles remain unique after soft deletion', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create(['title' => 'Audio']);
    Product::factory()->create(['product_category_id' => $category->id]);
    $this->from(route('admin.product-categories.index'))->delete(route('admin.product-categories.destroy', $category))->assertSessionHasErrors('delete');
    $this->assertNotSoftDeleted($category);
    $empty = ProductCategory::factory()->create(['title' => 'Reserved']);
    $empty->delete();
    $this->post(route('admin.product-categories.store'), ['title' => ' Reserved '])->assertSessionHasErrors('title');
});

test('products accept images and a self contained glb and expose public resource urls', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $this->post(route('admin.products.store'), catalogProductData($category, ['image' => UploadedFile::fake()->createWithContent('photo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=')), 'model_file' => catalogGlb()]))->assertRedirectToRoute('admin.products.index');
    $product = Product::firstOrFail();
    Storage::disk('public')->assertExists([$product->image, $product->model_file]);
    expect($product->model_file)->toEndWith('.glb');
    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'product_count' => 1]);
    $this->get(route('admin.products.edit', $product))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/products/form')->where('product.model_url', asset($product->model_file))->where('product.image_url', asset($product->image)));
});

test('product updates preserve files unless replaced and refresh both category counts', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $first = ProductCategory::factory()->create();
    $second = ProductCategory::factory()->create();
    $this->post(route('admin.products.store'), catalogProductData($first, ['model_file' => catalogGlb()]));
    $product = Product::firstOrFail();
    $old = $product->model_file;
    $this->put(route('admin.products.update', $product), catalogProductData($second, ['title' => 'Updated', 'stock' => 0]))->assertRedirectToRoute('admin.products.index');
    expect($product->fresh()->model_file)->toBe($old);
    $this->assertDatabaseHas('product_categories', ['id' => $first->id, 'product_count' => 0]);
    $this->assertDatabaseHas('product_categories', ['id' => $second->id, 'product_count' => 1]);
    $this->post(route('admin.products.update', $product), catalogProductData($second, ['_method' => 'put', 'model_file' => catalogGlb('new.glb')]))->assertRedirectToRoute('admin.products.index');
    $new = $product->fresh()->model_file;
    expect($new)->not->toBe($old);
    Storage::disk('public')->assertMissing($old);
    Storage::disk('public')->assertExists($new);
    $this->put(route('admin.products.update', $product), catalogProductData($second, ['remove_model_file' => true]))->assertRedirectToRoute('admin.products.index');
    expect($product->fresh()->model_file)->toBeNull();
    Storage::disk('public')->assertMissing($new);
});

test('deleting a product uses soft deletes preserves its assets and refreshes the category count', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $this->post(route('admin.products.store'), catalogProductData($category, ['model_file' => catalogGlb()]));
    $product = Product::firstOrFail();
    $this->delete(route('admin.products.destroy', $product))->assertRedirectToRoute('admin.products.index');
    $this->assertSoftDeleted($product);
    Storage::disk('public')->assertExists($product->model_file);
    $this->assertDatabaseHas('product_categories', ['id' => $category->id, 'product_count' => 0]);
    $this->get(route('admin.products.edit', $product))->assertNotFound();
});

test('products reject invalid field ranges and deleted categories', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $category->delete();
    $this->post(route('admin.products.store'), catalogProductData($category, ['title' => ' ', 'price' => 4294967296, 'stock' => 65536]))->assertSessionHasErrors(['title', 'price', 'stock', 'product_category_id']);
    $this->assertDatabaseCount('products', 0);
});

test('glb uploads reject renamed content missing buffers and external dependencies', function (string $kind) {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create();
    $file = match ($kind) {
        'fake' => UploadedFile::fake()->createWithContent('malicious.glb', '<?php echo "not a model";'),
        'extension' => catalogGlb('model.php'),
        'external' => catalogGlb('model.glb', ['buffers' => [['uri' => 'https://example.com/model.bin']]]),
        'truncated' => UploadedFile::fake()->createWithContent('model.glb', 'glTF'.pack('VVVV', 2, 900, 880, 0x4E4F534A)),
    };
    $this->post(route('admin.products.store'), catalogProductData($category, ['model_file' => $file]))->assertSessionHasErrors('model_file');
    $this->assertDatabaseCount('products', 0);
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
})->with(['fake', 'extension', 'external', 'truncated']);

test('catalog grids search filter sort paginate and show actual category product counts', function () {
    $this->actingAs(User::factory()->create());
    $category = ProductCategory::factory()->create(['product_count' => 99]);
    Product::factory()->create(['title' => 'Target laptop', 'price' => 200, 'product_category_id' => $category->id]);
    Product::factory()->create(['title' => 'Target phone', 'price' => 100, 'product_category_id' => $category->id]);
    Product::factory()->create(['title' => 'Other', 'product_category_id' => ProductCategory::factory()]);
    $this->get(route('admin.products.index', ['q' => 'Target', 'category' => $category->id, 'sort' => 'price', 'direction' => 'asc']))->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/products/index')->where('products.meta.total', 2)->where('products.data.0.title', 'Target phone')->has('products.data.0.product_category'));
    $this->get(route('admin.product-categories.index', ['q' => $category->title]))->assertOk()->assertInertia(fn (Assert $page) => $page->where('categories.data.0.product_count', 2));
    Product::factory()->count(14)->create(['product_category_id' => $category->id]);
    $this->get(route('admin.products.index', ['page' => 2]))->assertOk()->assertInertia(fn (Assert $page) => $page->where('products.meta.current_page', 2)->has('products.data', 5));
});

test('empty optional sort values use a valid default', function () {
    $this->actingAs(User::factory()->create());
    $this->get(route('admin.products.index', ['direction' => '']))->assertOk();
    $this->get(route('admin.product-categories.index', ['direction' => '']))->assertOk();
});
