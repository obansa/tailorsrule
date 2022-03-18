from django.shortcuts import render, HttpResponse
from rest_framework import status
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
# noinspection PyUnresolvedReferences
from .models import CustomUser
from .serializers import *
from rest_framework.authtoken.models import Token


@api_view(['get'])
def user_get(request):
    # if request.user.is_authenticated:
    user = CustomUser.objects.get(phone='91')
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'post'])
def customers(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            user = CustomUser.objects.get(phone='91')
            customer = user.tailor.customers.all()
            serializer = UserSerializer(customer, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'not auth'})


@api_view(['GET'])
def measurement(request):
    if request.method == 'GET':
        user = CustomUser.objects.get(phone='91')
        customers_masurment = []
        for item in user.tailor.customers.all():
            customers_masurment.append(item.measurement_profile)
        serializer = MeasurementSerializer(customers_masurment, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['get', 'post'])
def project(request):
    if request.method == 'GET':
        projects = Project.objects.filter(tailor=1)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['get', 'post','put'])
def project_image(request):
    if request.method == 'GET':
        project_images = ProjectImage.objects.filter(tailor=1)
        serializer = ProjectImageSerializer(project_images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['get'])
def settings(request):
    # if request.user.is_authenticated:
    tailor = Setting.objects.get(tailor=1)
    serializer = SettingsSerializer(tailor, many=False)
    return Response(serializer.data, status=status.HTTP_200_OK)

