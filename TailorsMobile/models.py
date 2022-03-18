from django.db import models
from MainSite.models import CustomUser
from django.dispatch import receiver
from django.db.models.signals import post_save


class Tailor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='tailor')
    customers = models.ManyToManyField(CustomUser, related_name='TailorCustomer')

    def __str__(self):
        return self.user.phone


class Setting(models.Model):
    default_men_top = '''{"shoulder_line": true,"sleeve": true,"arm": true,"neck": true,"bust_or_chest": true,
    "nipple_to_nipple": true,"shape": true,"half_cut": true,"top_length": true}'''
    default_men_down = '{"waist": true,"laps": true,"knees": true,"half_length": true,"base": true,"down_length": true}'
    default_ladies_top = '''{"shoulder_line": true,"sleeve": true,"arm": true,"neck": true,
    "breast_point": true,"under_bust": true,"shape": true,"half_cut": true,"top_length": true}'''
    default_ladies_down = '''{"gown_length": true,"waist": true,"hips_or_butt": true,"laps": true,"knees": true,
    "half_length": true,"base": true,"down_length": true}'''
    tailor = models.ForeignKey(Tailor, on_delete=models.CASCADE)
    measurement_men_top = models.TextField(max_length=1000, default=default_men_top.replace('"', "`"))
    custom_men_top = models.TextField(max_length=1000, default='{}')
    measurement_men_down = models.TextField(max_length=1000, default=default_men_down.replace('"', "`"))
    custom_men_down = models.TextField(max_length=1000, default='{}')
    measurement_ladies_top = models.TextField(max_length=1000, default=default_ladies_top.replace('"', "`"))
    custom_ladies_top = models.TextField(max_length=1000, default='{}')
    measurement_ladies_down = models.TextField(max_length=1000, default=default_ladies_down.replace('"', "`"))
    custom_ladies_down = models.TextField(max_length=1000, default='{}')

    def __str__(self):
        return self.tailor.user.phone

    @receiver(post_save, sender=Tailor)
    def create_user_setting(sender, instance, created, **kwargs):
        if created:
            Setting.objects.create(tailor=instance)

    @receiver(post_save, sender=Tailor)
    def save_user_setting(sender, instance, **kwargs):
        print(instance)
        instance.user.save()


class Project(models.Model):
    tailor = models.ForeignKey(Tailor, on_delete=models.CASCADE, related_name='ProjectTailor')
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ProjectCustomer')
    style = models.CharField(max_length=100, null=True, blank=True)
    price = models.CharField(max_length=10, null=True, blank=True)
    deu_date = models.DateField(blank=True, null=True)
    payment_advance = models.CharField(max_length=30, null=True, blank=True)
    payment_balance = models.CharField(max_length=30, null=True, blank=True)

    def __str__(self):
        return self.customer


class ProjectImage(models.Model):
    tailor = models.ForeignKey(Tailor, on_delete=models.CASCADE, related_name='ProjectImageTailor')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='Project')
    image = models.ImageField(upload_to='project_image', max_length=1000)

