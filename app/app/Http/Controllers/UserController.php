<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserUpdateRequest;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;

class UserController extends Controller
{
    public function __construct(public UserService $service) {}

    public function update(UserUpdateRequest $request): RedirectResponse
    {
        $this->service->update(
            user: $request->user(),
            file: $request->file('avatar'),
            first_name: $request->input('first_name'),
            last_name: $request->input('last_name'),
            email: $request->input('email'),
            username: $request->input('username')
        );

        return back();
    }
}
