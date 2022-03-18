from django.shortcuts import render
from django.http import HttpResponse


def home(request):
    return HttpResponse("<h1 style='color: blue; text-align: center; font-size: 55px;'>Welcome to Tailor's Rule</h1>")
