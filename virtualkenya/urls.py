from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',    
    url(r'^$', 'virtualkenya.views.home', name='index'),
    url(r'^info/$', 'virtualkenya.views.info', name='info'), 
    url(r'^virtualkenya/$', 'virtualkenya.views.feature', name='feature'),   
)


#Heroku Deployment

urlpatterns += patterns('',
    (r'^' + settings.STATIC_URL[1:] + '(?P.*)$', 'django.views.static.serve',
         {'document_root': settings.STATIC_ROOT}),)
