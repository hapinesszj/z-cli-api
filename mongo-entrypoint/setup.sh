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
db.template.insertMany([{
  "name": "标准项目模板一【Vue2】",
  "npmName": "@z-cli-templates/vue2-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "project"
  ],
  "buildPath": "dist"
},
{
  "name": "标准项目模板二【Vue3】",
  "npmName": "@z-cli-templates/vue3-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "project"
  ],
  "buildPath": "dist"
},
{
  "name": "标准项目模板三【Vue3 + TypeScript】",
  "npmName": "@z-cli-templates/vue3-ts-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "project"
  ],
  "buildPath": "dist"
},
{
  "name": "标准项目模板四【React + TypeScript】",
  "npmName": "@z-cli-templates/react-ts-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "project"
  ],
  "buildPath": "dist"
},
{
  "name": "通用前中台基础工程",
  "npmName": "@z-cli-templates/middleground-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "engineering"
  ],
  "buildPath": "dist"
},
{
  "name": "通用后台基础工程",
  "npmName": "@z-cli-templates/admin-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "engineering"
  ],
  "buildPath": "dist"
},
{
  "name": "微前端基础工程",
  "npmName": "@z-cli-templates/micro-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "engineering"
  ],
  "buildPath": "dist"
},
{
  "name": "跨平台基础工程",
  "npmName": "@z-cli-templates/platform-template",
  "version": "1.0.0",
  "type": "normal",
  "installCommand": "npm install",
  "startCommand": "npm run serve",
  "ignore": [
    "**/public/**"
  ],
  "tag": [
    "engineering"
  ],
  "buildPath": "dist"
}])
EOF

