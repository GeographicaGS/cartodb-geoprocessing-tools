#!/bin/bash

function deploy(){
  cp s3_website.$1.yml s3_website.yml;
  cp src/js/Config.$1.js src/js/Config.js;
  docker-compose up builder
  s3_website cfg apply
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
  all)
    deploy sla;
    deploy cdb;
    shift
  ;;
  *)
      echo "Bad parameters"
      exit
    ;;
esac
