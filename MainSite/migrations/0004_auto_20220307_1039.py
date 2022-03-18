# Generated by Django 3.2.5 on 2022-03-07 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainSite', '0003_alter_customuser_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='address',
            field=models.TextField(blank=True, max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='country',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='profile picture'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='is_tailor',
            field=models.BooleanField(default=False, help_text='Designates whether the user is a tailor or customer .', verbose_name='tailor status'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='profilePic',
            field=models.ImageField(default='default/default.png', upload_to='profile_image', verbose_name='profile picture'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='state',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='profile picture'),
        ),
    ]
