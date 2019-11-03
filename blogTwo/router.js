const express = require('express');
var User = require('./models/user');
var md5 = require('./md5');

var router = express.Router();

router.get('/',function(req, res) {
    // console.log(req.session.user);
    res.render('index.html');
})

router.get('/login',function(req, res){
    res.render('login.html');
})

router.post('/login',function(req, res) {

})

router.get('/register',function(req, res){
    res.render('register.html')
})

router.post('/register', function(req, res) {
    // console.log(req.body);
    //1.获取表单提交的数据
    //2. 操作数据库
        //判断该用户是否存在
        //如果已存在，不允许注册
        //如果不存在，注册新用户

    //3. 发送响应
    var body = req.body;
    User.findOne({
        $or: [
            {
                email: body.email
            },
            {
                nickname: body.nickname
            }
        ]
    },function(err,data) {
        if(err) {
            return res.status(500).json({
                success: false,
                message: '服务端错误'
            })
        }
        // console.log(data);
        if(data) {
            //邮箱或者昵称已存在
            return res.status(200).json({
                err_code: 1,  //自定义状态码的作用是便于进行业务上的判断，err_code：1代表有的东西错了
                message: 'Email or nickname already exists'
            })
            return res.send('邮箱或者密码已存在，请重试')
            //用重新渲染当前页面并传递给前端页面数据来解决 表单提交的方法
            // return res.render('register.html',{  
            //     err_message: '邮箱或秘密已存在',
            //     form: body
            // })
        }
        //对密码进行md5二层加密
        body.password = md5(md5(body.password));
        new User(body).save(function(err, user){
            if(err) {
                return res.status(500).json({
                   err_code: 500,
                    message: 'Internal error'
                })
            }

            //注册成功，使用Session记录用户的登录转台
            req.session.user = user;

            //Express提供了一个相应的方法: json()
           //该方法接受一个对象作为参数，它会自动帮你把对象字符串再发给浏览器,json()会把json对象字符串发送给浏览器控制台
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })

            //服务端重定向只针对同步请求才有效，异步请求无效
            // res.redireact('/');
        })
       
    })
})
    
module.exports = router;