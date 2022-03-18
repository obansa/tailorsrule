from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.conf import settings
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, phone, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        # if not email:
        #     raise ValueError('The given email must be set')
        # email = self.normalize_email(email)
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(phone, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    phone = models.CharField(_('phone number'), max_length=15, unique=True)
    gender = models.CharField(_('gender'), max_length=6)
    address = models.TextField(max_length=1000, blank=True, null=True)
    is_tailor = models.BooleanField(
        _('tailor status'),
        default=False,
        help_text=_('Designates whether the user is a tailor or customer .'),
    )
    country = models.CharField(_('country'), max_length=50, blank=True, null=True)
    state = models.CharField(_('state'), max_length=50, blank=True, null=True)
    profilePic = models.ImageField(_('profile picture'), upload_to='profile_image', default='default/default.png')

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['gender']

    objects = CustomUserManager()


class Measurement(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='measurement_profile')
    shoulder_line = models.CharField(max_length=30, null=True, blank=True)
    sleeve = models.CharField(max_length=30, null=True, blank=True)
    arm = models.CharField(max_length=30, null=True, blank=True)
    neck = models.CharField(max_length=30, null=True, blank=True)
    bust_or_chest = models.CharField(max_length=30, null=True, blank=True)
    breast_point = models.CharField(max_length=30, null=True, blank=True)
    nipple_to_nipple = models.CharField(max_length=30, null=True, blank=True)
    under_bust = models.CharField(max_length=30, null=True, blank=True)
    shape = models.CharField(max_length=30, null=True, blank=True)
    half_cut = models.CharField(max_length=30, null=True, blank=True)
    top_length = models.CharField(max_length=30, null=True, blank=True)
    gown_length = models.CharField(max_length=30, null=True, blank=True)
    waist = models.CharField(max_length=30, null=True, blank=True)
    hips_or_butt = models.CharField(max_length=30, null=True, blank=True)
    laps = models.CharField(max_length=30, null=True, blank=True)
    knees = models.CharField(max_length=30, null=True, blank=True)
    half_length = models.CharField(max_length=30, null=True, blank=True)
    base = models.CharField(max_length=30, null=True, blank=True)
    down_length = models.CharField(max_length=30, null=True, blank=True)
    custom_record = models.TextField(max_length=2000, null=True, blank=True)

    def __str__(self):
        return self.user.phone

    @receiver(post_save, sender=CustomUser)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Measurement.objects.create(user=instance)

    @receiver(post_save, sender=CustomUser)
    def save_user_profile(sender, instance, **kwargs):
        instance.measurement_profile.save()