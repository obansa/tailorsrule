# Generated by Django 3.2.5 on 2022-03-15 11:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Store', '0003_alter_category_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='information',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='ProductInformation',
        ),
    ]
