<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('website/Home'))->name('home');
Route::get('/services', fn () => Inertia::render('website/Services'))->name('services');
Route::get('/about', fn () => Inertia::render('website/About'))->name('about');
Route::get('/contact', fn () => Inertia::render('website/Contact'))->name('contact');
