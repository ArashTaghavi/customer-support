<?php

test('redirects guests to login', function () {
    $response = $this->get(route('app.index'));

    $response->assertRedirect(route('login'));
});
