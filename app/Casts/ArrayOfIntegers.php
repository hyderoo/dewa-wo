<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use InvalidArgumentException;

class ArrayOfIntegers implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return array
     */
    public function get($model, $key, $value, $attributes)
    {
        if ($value === null) {
            return [];
        }

        $array = json_decode($value, true);

        return array_map(function ($item) {
            return (int) $item;
        }, $array);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        if (!is_array($value)) {
            throw new InvalidArgumentException("The {$key} attribute must be an array.");
        }

        $value = array_map(function ($item) {
            return (int) $item;
        }, $value);

        return json_encode($value);
    }
}
