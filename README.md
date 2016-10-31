#Seshat
*You're story is worth to be written*

Seshat is a tool to help you writting a novel whatever is your device. It's a web application that will be able to run on your browser, even offline (but not for now).

## Installation
Seshat is built using Play v1.4 (you can [download it here](https://downloads.typesafe.com/play/1.4.2/play-1.4.2.zip)). I'll assume play is installed and available in your path.

1. Clone this repository
2. Clone repository "https://github.com/corwinAmbre/play1" next to this repository
2. Go to `application` folder
3. Run command `play install greenscript-1.2.8b` to install external module
4. Run command `play dependencies` to link local copy of dependencies to your application
5. Run command `play run` to start the application and go to [http://localhost:9000](http://localhost:9000)
6. A default user has been created with credentials admin/admin as the default admin user

To go on production, first you need to generate a new secret key by using `play secret` inside `application` folder. You can then create a war file using `play war` command.
A default admin user is created at start-up to login:

* Username: admin@nomail.com (can be changed in application.conf file)
* Password: admin (should be changed from the application after first login)

## Configuration options
By default, database is in-memory for testing and using a H2 database written on a local file in production. Samples are available in the file for other databases, for more options, go to play documentation.

Versions of novels are stored in folder `documents/versions` at the root of the application. If you want to change, update `seshat.paths.versions` entry in `application.conf` file. Ensure that user running Seshat will have write permissions on target folder.