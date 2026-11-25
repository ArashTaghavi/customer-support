<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Http\Responses\LoginResponse;

class ShowroomLoginResponse extends LoginResponse
{
    /**
     * @param  Request  $request
     */
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        if ($request->input('return_to') === 'shop') {
            $request->session()->forget('url.intended');

            if (! $request->wantsJson()) {
                return to_route('shop');
            }
        }

        return parent::toResponse($request);
    }
}
