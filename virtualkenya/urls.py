# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',    
    url(r'^$', 'virtualkenya.views.home', name='index'),
    url(r'^info/$', 'virtualkenya.views.info', name='info'), 
    url(r'^virtualkenya/$', 'virtualkenya.views.feature', name='feature'),   
)


#Heroku Deployment
if settings.DEBUG:
   urlpatterns += staticfiles_urlpatterns()
