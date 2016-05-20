#!/bin/bash

function deploy(){
  cp s3_website.$1.yml s3_website.yml;
  cp src/js/Config.sla.js src/js/Config.js;
  docker-compose up builder
  s3_website push 
}

case $1 in
  sla)
    deploy $1;
    shift
    ;;

  cdb)
    deploy $1;
    shift
    ;;
  *)
      echo "Bad parameters"
      exit
    ;;
esac
