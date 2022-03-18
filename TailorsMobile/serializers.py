from .models import *
from rest_framework import serializers
from rest_framework.authtoken.models import Token
# noinspection PyUnresolvedReferences
from MainSite.models import Measurement, CustomUser


class UserSerializer(serializers.ModelSerializer):
    profilePic = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = CustomUser
        fields = ['phone', 'first_name', 'last_name', 'email', 'address', 'profilePic']


class MeasurementSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(many=False, slug_field='phone', queryset=CustomUser.objects.all())

    class Meta:
        model = Measurement
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    tailor = serializers.ReadOnlyField(source='tailor.user.phone')
    customer = serializers.SlugRelatedField(many=False, slug_field='phone', queryset=CustomUser.objects.all())

    class Meta:
        model = Project
        fields = '__all__'


class ProjectImageSerializer(serializers.ModelSerializer):
    tailor = serializers.ReadOnlyField(source='tailor.user.phone')
    project = serializers.SlugRelatedField(many=False, slug_field='id', queryset=Project.objects.all())
    # project = serializers.CharField(source=Project.objects.)
    image = serializers.ImageField(max_length=None, use_url=True)

    class Meta:
        model = ProjectImage
        fields = '__all__'


class SettingsSerializer(serializers.ModelSerializer):
    tailor = serializers.ReadOnlyField(source='tailor.user.phone')

    class Meta:
        model = Setting
        fields = '__all__'

