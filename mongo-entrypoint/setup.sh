#!/bin/bash

set -e

mongosh <<EOF
use admin
db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')
use z-cli
db.createUser({
  user:  '$MONGO_USERNAME',
  pwd: '$MONGO_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'z-cli'
  }]
})
db.createCollection('template')
db.template.insertMany([
  {
    "name": "vue3基础项目模版",
    "npmName": "@spark-bit/z-cli-template-vue3",
    "version": "1.0.0",
    "type": "normal",
    "installCommand": "npm install",
    "startCommand": "npm run dev",
    "isComplete" : false,
    "ignore": [
      "**/public/**"
    ],
    "tag": [
      "project"
    ],
    "buildPath": "dist"
  }
])
EOF

