from django.shortcuts import render
from django.core import serializers

def home(request):
	return render(request, 'virtualkenya/index.html')

def info(request):
	return render(request, 'virtualkenya/info.html')

# Create your views here.
