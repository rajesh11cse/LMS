#!/bin/bash

#sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080

NAME=ZCEADMIN

APP_PATH=/home/ec2-user/zcea_admin

APP_JS=server.js



#export PATH=$PATH:/usr/lib/node_modules

#export NODE_PATH=$NODE_PATH:/usr/lib/node_modules

FOREVER=./node_modules/forever/bin/forever

PID_FILE=$APP_PATH/$NAME.pid

export NODE_ENV=production

export HOST=0.0.0.0
#export HOST=10.28.159.71



start() {

#grunt clean copy cssmin uglify

    echo "Starting $NAME  node instance: "

    exec $FOREVER -a -l $APP_PATH/logs/access.log --pidFile $PID_FILE  -e $APP_PATH/logs/errors.log --sourceDir=$APP_PATH start $APP_JS

}


stop() {

    echo "Shutting down $NAME node instance : "

    pidId=$(cat $PID_FILE);

    id=$($FOREVER list 2>&1 | awk "{if (\$7 == ${pidId}) { print \$2 } }" | head -n 1 | tr -d '[]')

    exec $FOREVER --sourceDir=$APP_PATH stop $id

}



case "$1" in

    start)

        start

    ;;

    stop)

        stop

    ;;

    *)

        echo "Usage:  {start|stop}"

        exit 1

    ;;
esac
