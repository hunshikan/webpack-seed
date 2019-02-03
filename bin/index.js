#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const ora = require('ora')

const descCheck = require('./middleware/desc')
const { getFileName, log, successLog, errorLog } = require('./utils/utils')

program.action(() => {
  log(`
    0. 模块是基于views层创建.
    1. 文件名不包含数字, 模块名即为文件名, 不能与页面现存重复.
    2. 常规的就是直接输入文件名(模块名)即可自动创建页面.
    3. 创建嵌套页面, 需要输入嵌套规则 path/path/path.
  `)
  inquirer
    .prompt([
      {
        name: 'description',
        message: '请输入页面模块名称',
        validate: descCheck
      },
      {
        name: 'title',
        message: '请输入页面title(非必填,建议填写)'
      }
    ])
    .then(answer => {
      const { description, title } = answer
      const { fileName } = getFileName(description)
      fs.mkdir(path.resolve(__dirname, '../', `src/views/${fileName}`), err => {
        if (err) {
          errorLog(err)
          throw err
        }
        successLog('创建目录成功')
        const tplContent = fs.readFileSync(path.resolve(__dirname, 'templates/tpl.txt')).toString()
        const indexContent = fs.readFileSync(path.resolve(__dirname, 'templates/index.txt')).toString()

        const parseTplResult = handlebars.compile(tplContent)({
          pageTitle: title ? title : '',
          fileName
        })
        const parseIndexResult = handlebars.compile(indexContent)({
          fileName
        })

        fs.writeFileSync(path.resolve(__dirname, '../', `src/views/${fileName}/tpl.js`), parseTplResult, 'utf8')
        fs.writeFileSync(path.resolve(__dirname, '../', `src/views/${fileName}/index.js`), parseIndexResult, 'utf-8')
        fs.writeFileSync(path.resolve(__dirname, '../', `src/views/${fileName}/${fileName}.ejs`), '')
        fs.writeFileSync(path.resolve(__dirname, '../', `src/views/${fileName}/${fileName}.scss`), '')
        successLog('文件创建成功')
      })
    })
})
program.parse(process.argv)
