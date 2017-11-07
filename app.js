var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var wechat_file = path.join(__dirname,'./config/wechat.txt')

var config = {
	wechat:{
		appID:'wx7539a9456221a597',
		appSecret:'00a9a6e1653a79d7e39d4099f91bca45',
		token:'jinjianhua',
		getAccessToken:function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken:function(data){
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data)
		}
	}
}
var app = new Koa()
app.use(wechat(config.wechat))

app.listen(2000)
console.log('listening 2000')