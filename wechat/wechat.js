var request = require('request')
var util = require('../libs/util')
var fs = require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken:prefix + 'token?grant_type=client_credential',
    upload:prefix + 'media/upload?'
}

function Wechat(opts){
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()

    
}
Wechat.prototype.fetchAccessToken = function(data){
    var that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }

    that.getAccessToken()
    .then(function(data){
        console.log(3)
        try{
            data = JSON.parse(data)
        }
        catch(e){
            return that.updateAccessToken()
        }
        if(that.isValidAccessToken(data)){
            console.log(data)
            return Promise.resolve(data)
        }else{
            return that.updateAccessToken()
        }
    })
    .then(function(data){
        console.log(4)
        console.log(data)
        that.access_token = data.access_token
        that.expires_in = data.expires_in

        that.saveAccessToken(data)
        return Promise.resolve(data)
    })
}
Wechat.prototype.isValidAccessToken = function(data){
    console.log('isValidAccessToken')
    if(!data || !data.access_token || !data.expires_in){
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if(now<expires_in){
        return true
    }
    else{
        return false
    }
}
Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

    return new Promise(function(resolve,reject){
        let opts = {url:url,json:true}
        util.request(opts)
        .then(function(data){
            console.log('data',data)
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in -20)*1000
            data.expires_in = expires_in

            resolve(data)
        })
        .catch((e)=>{
            console.log('updateAccessToken error')
        })
    })
}
Wechat.prototype.uploadMaterial = function(type,filepath){
    var that = this
    var form = {
        media:fs.createReadStream(filepath)
    }
    var appID = this.appID
    var appSecret = this.appSecret
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.upload + '&access_token=' + data.access_token + '&type=' + type
            let opts = {url:url,json:true,method:'POST',formData:form}
            util.request(opts)
            .then(function(res){
                var _data = res[1]
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('upload material fails')
                }
                
            })
            .catch((e)=>{
                console.log('upload material error')
                reject(e)
            })
        })
        
    })
}
Wechat.prototype.reply = function(){
    var content = this.body
    var message = this.weixin
    // console.log('reply content',content)
    // console.log('reply message',message)
    var xml = util.tpl(content,message)
    console.log('reply xml',xml)
    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}
module.exports = Wechat