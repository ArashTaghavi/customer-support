<?php

namespace App\Services;

class ChatResponsePayload
{
    /**
     * @param  array<string, mixed>  $answer
     * @return array<string, mixed>
     */
    public static function forBroadcast(array $answer): array
    {
        foreach ($answer['blocks'] ?? [] as $index => $block) {
            if (in_array($block['type'], ['products', 'orders'], true)) {
                $answer['blocks'][$index]['data'] = array_values(array_map(
                    fn (array|int $item): int => is_array($item) ? $item['id'] : $item,
                    $block['data'],
                ));
            } elseif ($block['type'] === 'order') {
                $answer['blocks'][$index]['data'] = isset($block['data']['id'])
                    ? [$block['data']['id']]
                    : $block['data'];
            }
        }

        return $answer;
    }
}
