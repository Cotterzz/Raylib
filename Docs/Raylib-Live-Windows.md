# Setting up Raylib-Live on Windows
This has been tested on Windows 11, but should be the same for Windows 10
## Git
You need the git CLI installed so that both emsdk and Raylib-Live can install other dependencies automatically.
Check to see if you have it by going to the command line† and entering ```git --version``` - it needs to be greater than 1.6.5
If it doesn't recognise that then either it isn't installed or there's not a PATH variable* pointing to the folder containing git.exe

To install go here: https://www.git-scm.com/download/win and download and install the windows portable version.
Make sure the cmd folder from that install is set in your PATH environment variables*

Note also that the github CLI (gh.exe), or github desktop probably wont work. They're fine for manually cloning emsdk and Raylib-Live, but not for the automated git parts of the process.

## Python
You will need python 3.6 or higher for emsdkto do it's automatic dependency update as well.
Check to see if you have it by going to the command line† and entering ```py --version```
If not go here and download the right installer for your system: https://www.python.org/downloads/windows/
(If in doubt it will be the 64 bit version. It shoudld set the PATH variable* for you)

## Emsdk
You will need to start by cloning the emsdk repo.
You can go here https://github.com/emscripten-core/emsdk and click on the green code button to either download a zip of the repo or dwonload in github desktop.
Or start with the command line and ```git clone https://github.com/emscripten-core/emsdk.git```
After that you will need to do the following to complete the installation (the emsdk repo is only part of the sdk)
1. If not already there, navigate to the directory with the command line ```cd emsdk```
2. Then ```emsdk install latest``` to complete the installation, this may (and should) take a while.
3. Then ```emsdk activate latest``` to activate the various components of the sdk, which will create a few more config files.
4. Then ```emsdk_env.bat``` to add some permanent, final PATH variables

## * PATH variables

## † Command line
Windows 11 may default to giving you the powershell console, or Windows 10 a normal command line as a regular user.
Both of these may work, but if you have any issues, it's best to run the regular command line as administrator.
Go to the start menu or windows-S and type 'cmd', then right click on the command line icon and select 'run as administrator'
