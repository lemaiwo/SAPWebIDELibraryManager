# SAP Web IDE - Library manager
This is a feature created for the SAP Web IDE. It enables you to search thourgh CDNJS for JavaScript libraries and automates importing the libraries.


See how it works in this video:
<p align="center">
<a href="https://youtu.be/GbGyt0_7pVg" target="_blank">
<img src="http://img.youtube.com/vi/GbGyt0_7pVg/0.jpg" 
alt="SAP Web IDE - Library manager" width="640" height="360" /></a>
</p>


# Getting started

## Create destination

Create a file without extension and past the following lines in the file:
```
Description=Library Manager
Type=HTTP
Authentication=NoAuthentication
WebIDEUsage=feature
Name=LibraryManager
WebIDEEnabled=true
CloudConnectorVersion=2
URL=https\://sapwebidelibrarymanager-a6ac3f497.dispatcher.hana.ondemand.com
ProxyType=Internet
```

## Import destination

1. Open your HANA Cloud Platform Cockpit
2. Go to Connectivity
3. Open Destinations
4. Import the created destination
5. Save

## SAPWebIDE Settings

1. Start by restarting the SAPWebIDE
2. Open settings
3. Select Plugins
4. Change repository to "Features"
5. Enable the Library manager
6. Restart the SAPWebIDE


# Contribute

This is a plugin from me as a developer to help you as a developer. If you have a great idea or just want to help your welcome to help me improving this plugin!

# Contact

You're always welcome to update me about bugs at wouterlemaire120@hotmail.com