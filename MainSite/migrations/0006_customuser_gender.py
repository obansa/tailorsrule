# Generated by Django 3.2.5 on 2022-03-10 10:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainSite', '0005_auto_20220307_1102'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='gender',
            field=models.CharField(default='male', max_length=6, verbose_name='gender'),
            preserve_default=False,
        ),
    ]