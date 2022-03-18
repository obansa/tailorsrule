# Generated by Django 3.2.5 on 2022-03-07 11:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('style', models.CharField(blank=True, max_length=100, null=True)),
                ('price', models.CharField(blank=True, max_length=10, null=True)),
                ('payment_advance', models.CharField(blank=True, max_length=30, null=True)),
                ('payment_balance', models.CharField(blank=True, max_length=30, null=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ProjectCustomer', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tailor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customers', models.ManyToManyField(related_name='TailorCustomer', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='tailor', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Setting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('measurement_men_top', models.TextField(default='{`shoulder_line`: true,`sleeve`: true,`arm`: true,`neck`: true,`bust_or_chest`: true,\n    `nipple_to_nipple`: true,`shape`: true,`half_cut`: true,`top_length`: true}', max_length=1000)),
                ('custom_men_top', models.TextField(default='{}', max_length=1000)),
                ('measurement_men_down', models.TextField(default='{`waist`: true,`laps`: true,`knees`: true,`half_length`: true,`base`: true,`down_length`: true}', max_length=1000)),
                ('custom_men_down', models.TextField(default='{}', max_length=1000)),
                ('measurement_ladies_top', models.TextField(default='{`shoulder_line`: true,`sleeve`: true,`arm`: true,`neck`: true,\n    `breast_point`: true,`under_bust`: true,`shape`: true,`half_cut`: true,`top_length`: true}', max_length=1000)),
                ('custom_ladies_top', models.TextField(default='{}', max_length=1000)),
                ('measurement_ladies_down', models.TextField(default='{`gown_length`: true,`waist`: true,`hips_or_butt`: true,`laps`: true,`knees`: true,\n    `half_length`: true,`base`: true,`down_length`: true}', max_length=1000)),
                ('custom_ladies_down', models.TextField(default='{}', max_length=1000)),
                ('tailor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='TailorsMobile.tailor')),
            ],
        ),
        migrations.CreateModel(
            name='ProjectImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(max_length=1000, upload_to='project_image')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Project', to='TailorsMobile.project')),
                ('tailor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ProjectImageTailor', to='TailorsMobile.tailor')),
            ],
        ),
        migrations.AddField(
            model_name='project',
            name='tailor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ProjectTailor', to='TailorsMobile.tailor'),
        ),
    ]