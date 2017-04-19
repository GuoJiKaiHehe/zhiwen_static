$(function(){
check_user();


    $('button').button();
$('#search_button').button({
     //   label:'搜索',
    icons:{
        'primary':'ui-icon-search'
    }
})
//提问按钮
$('#question_button').click(function(){
    if($.cookie('user')){
        $('#question').dialog('open');
      
    }else{
        $('#error').dialog('open');
        setTimeout(function(){
            $('#error').dialog('close');
            $('#login').dialog('open');
        },1500);
    }
}).button({
    icons : {
     primary : 'ui-icon-lightbulb',
    },
});

 CKEDITOR.replace( 'content_e' );

$('#question').dialog({
    autoOpen:false,
    modal:true,
    width:640,
    height:480,
    resizable:false,
    show:true,
    buttons:{
        '发布':function(){
          
            $(this).submit();
        }
    }

}).validate({
    submitHandler:function(form){
       
    var user=$.cookie('user');

   var question=store.get('question')||[];
   console.log(question)
   if(question.length==0){
     qid=1;
   }else{
      qid=question[question.length-1].id+1;
   }
   
    var q_temp={
        'id':qid,
        'title':$('#title').val(),
        'content':CKEDITOR.instances.content_e.getData(),
        'user':user,
        'date':new Date().Format("yyyy-MM-dd hh:mm:ss")
    };
    question.push(q_temp);
    store.set('question',question);
    $('#question').resetForm();
    CKEDITOR.instances.content_e.setData("");
   var html = '<h4>' + user + ' 发表于 ' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '</h4><h3>' +$('#title').val() + '</h3><div class="editor" qid="'+qid+'" >' + CKEDITOR.instances.content_e.getData()+ '</div><div class="bottom"> <span class="comment" data-id="' + qid + '" data-user="' + user + '" >0条评论</span> <span class="up" index='+(question.length-1)+'>收起</span></div><hr noshade="noshade" size="1" />'+
        '<div class="comment_list">'+

        '</div>';
        $('.main_left .content').prepend(html);



},
    rules:{
        title:{
            required:true,
            minlength:10,
        },
        content:{
            required:true,
        }
    },
    messages:{
        title:{
            required:'不得为空',
            minlength:'不得小于{0}位'
        },
        content:{
             required:'不得为空',
        }
    }
});

if( store.get('question') && store.get('question').length!=0){
    (function(){
        var json=store.get('question');
        json.sort(function(a,b){

            return b.id-a.id;  //倒叙
        })
        var comment=store.get('comment')||[];

        for(var i=0;i<json.length;i++){
            var count=0;
            for(var j=0;j<comment.length;j++){
                if(comment[j].qid==json[i].id){
                    count++;
                }
            }
            json[i].count=count;
        }
        var html='';
        var summary=[];
        for(var i=0;i<json.length;i++){

        html += '<h4>' + json[i].user + ' 发表于 ' + json[i].date + '</h4><h3>' +json[i].title + '</h3><div class="editor" qid="'+json[i].id+'" >' + json[i].content+ '</div><div class="bottom"> <span class="comment" data-id="' + json[i].id + '" data-user="' + json[i].user + '" >'+json[i].count+'条评论<\/span> <span class="up" index='+i+'>收起</span></div><hr noshade="noshade" size="1" />'+
        '<div class="comment_list">'+

        '<\/div>';

        }
         var arr=[];
     $('#main .main_left .content').append(html);

         $.each($('.editor'),function(index,value){
        
            arr[index]=$(value).html();  //保存所有字符；
            var xx=arr[index].replace(/<[^>]+>/g,"");
            summary[index] = xx.substr(0,100)+'...<span class="down">显示全部</span>'; // 摘要内容；

            if(arr[index].length>100){
                $(value).html(summary[index]);
                
            }
            $('.bottom .up').hide();
        });

          
            $('body').on('click','.up',function(){
               var  content=$(this).parent();
                var  qid=content.attr('qid');

                $('.editor').eq(qid-1).html(summary[qid-1]);
                var down=$(this).clone(true);
                down=down.attr('class','down').html('');
                content.html(summary[qid-1]);
        
                 content.append(down)
               
               
            }); 



           /*$.each($('.bottom'),function(index,value){
            $(this).on('click','.down',function(){
               alert(index);
                $('.editor').eq(index).html(arr[index]);

                $('.editor .up').eq(index).show();
               

            }); 


        })*/
    $('body').on('click','.down',function(){
       var  content=$(this).parent();
       var  qid=content.attr('qid');
        var up=$(this).attr('class','up').html('收起').clone(true);
      
        content.html(arr[qid-1]);
        
        content.append(up)
    });


         $.each($('.bottom'),function(index,value){
            $(this).on('click','.comment',function(){

                var qid=$(this).attr('data-id');
                var comment_this=this;
               var  comment_list=$(comment_this).parent().next().next();
               if(comment_list.is(':visible')){
                    comment_list.hide(1000);
               }
                if(!comment_list.has('form').length){
                     var str_add='<form>'+
        '<dl class="comment_add">'+
         '<dt><textarea name="comment"></textarea></dt><input type="hidden" name="qid" value="'+$(comment_this).attr('data-id')+'" /><input type="hidden" name="user" value="'+$.cookie('user')+'" /><dd><button type="button" class="comment_send"  >发表</button></dd>'+
         '</dl>'+
         '</form>';
         $(comment_list).append(str_add).show();
         $('.comment_send').button();
         var comment=store.get('comment')||[];
         var com_con='';

         for(var i=0;i<comment.length;i++){
            if(comment[i].qid==qid){
                com_con+='<dl class="comment_content"><dt>' + comment[i].user+ '</dt><dd>' + comment[i].content + '</dd><dd>' +comment[i].date+ '</dd></dl>';
            }
            
         }
         $(comment_list).prepend(com_con);

                }
            })
        })

         $('body').on('click','.comment_send',function(){
                var uid=$(this).parent().prev().val();
                var qid=$(this).parent().prev().prev().val();
                var question=store.get('question');
                var user='';
                
                var comment=store.get('comment')||[];
                var content=$(this).parent().prev().prev().prev().find('textarea[name=comment]');
                var c_temp={
                    'qid':qid,
                    'user':$.cookie('user'),
                    'content':content.val(),
                    'date':new Date().Format('yyyy-MM-dd h:m:s')
                };
                comment.push(c_temp);
                store.set('comment',comment);
var comment_list=content.parent().parent().parent().parent();
 comment_list.prepend('<dl class="comment_content"><dt>' + $.cookie('user') + '</dt><dd>' + content.val() + '</dd><dd>' +new Date().Format('yyyy-MM-dd H:i:s')+ '</dd></dl>');
            content.val('')


         });


    })();


   
}else{

$('#main .main_left .content').append('<p style="text-align:center;">没有任何问题！</p>');

}



   $('#birthday').datepicker({
    changeMonth:true,
    changeYear:true,
    yearRange:'1955:',
    maxDate:0,
   });

$('#birthday').datepicker('setDate','2013-5-6');//设置
    $('#reg input[title]').tooltip({
        position:{
            my:'left top',
            at:'right+15 top-5'
        }
        
    });  //提示框!

    $('#loading').dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,
        resizable:false,
        draggable:false,
        width:180,
        height:50,

    }).parent().find('.ui-widget-header').hide();

  // $('#loading').dialog('open')
$('#error').dialog({
        autoOpen:false,
        modal:true,
        closeOnEscape:false,
        resizable:false,
        draggable:false,
        width:250,
        height:50,

    }).parent().find('.ui-widget-header').hide();

    $('#email').autocomplete({
        autoFocus:true,
        source:function(request,response){
          //  alert(request.term) //监听输入的字符；
           // response(['aa','bbbb','cccc','aaaa']);//自定义
           var hosts = ['qq.com','163.com', '263.com', 'gmail.com', 'hotmail.com','aaaaaa.com'], 
                term=request.term,
                //response(hosts),
                ix=term.indexOf('@'),
                host='',
                name=term,
                result=[];
                result.push(term);
                if(ix>-1){
                    //表示找到了
                    name=term.slice(0,ix);
                    host=term.slice(ix+1);
                }
               // alert(host);
               if(name){
                    var findedHosts=[];
                    if(host){ //如果输入了@后面多加一个字符就代表hosts存在；
                        findedHosts=$.grep(hosts,function(value,index){
                            return value.indexOf(host)>-1; //表示找到的；
                        })
                    }else{
                        //hosts不存在
                        findedHosts=hosts;
                    }
                   var findResult=$.map(findedHosts,function(value,index){
                            //value表示找到的域名！//通过拼接；
                        return name+'@'+value;
                    });
                    result== result.concat(findResult);
               }
                response(result); //最终呈现的效果！
        }
    });

$('#header').on('click','#logout',function(e){
    e.preventDefault();
    $.removeCookie('user');
    check_user();
})

function check_user(){
    if($.cookie('user')){
        $('#member').show().html($.cookie('user')+'，你好！');
        $('#logout').show();
        $('#reg_a').hide();
        $('#login_a').hide();
    }else{
        $('#member').hide();
        $('#logout').hide();
        $('#reg_a').show();
        $('#login_a').show();
    }
}


$('#login_a').click(function(){

        $('#login').dialog('open');
 });
$('#login').dialog({
         title:'登陆',
         autoOpen:false,
         resizable:false,
         width:'340',
         hegiht:"200",
         modal:true,
         buttons : {
            '登陆' : function () {
          
                $(this).submit();
            }
        },
     
    }).validate({
            showErrors:function(errorMap,errorList){
                var error=this.numberOfInvalids();
                //alert(error);
                this.defaultShowErrors();

                if(error>0){
                    $('#login').dialog('option','height',20*error+240);
                }else{
                    $('#login').dialog('option','height',240);
                }
            }, 
            highlight:function(element,errorClass){
                // 当错误的时候
                $(element).css('border','1px solid #630');
                 $(element).parent().find('span').html('*').removeClass('succ');
            },
            unhighlight:function(element,errorClass){
                //当成功的时候~
                $(element).css('border','1px solid #ccc');
                $(element).parent().find('span').addClass('succ').html('&nbsp;');
            },
            
            submitHandler : function (form) {
              
                  
            var username=$('input[name=user]').val();
            var password=$('input[name=pass]').val();
            var users=store.get('users')||[];
            var t=0;
            for(var i=0;i<users.length;i++){
                if(users[i].username==username && users[i].password==password){
                    t=1;
                }
            }
            if(t>0){
                $.cookie('user',username);
                $('#login').dialog('close');
                dialog.smaile('登录成功！');
                $('#reg_a').remove();
                $('#member').show().html(username+',你好！');
                $('#login_a').remove();
                $('#logout').show();
            }else{
                dialog.error('账号或密码错误！');
            }

            },
            errorLabelContainer:'ol.login_error',
            wrapper:'li',
            rules:{
                user:{
                   required : true,
                    minlength:2,
                    
                },
                pass:{
                    required:true,
                    minlength:6,
                    
                },
               
            },
            messages:{
                user:{
                    
                    minlength:'账号不得小于{0}位',
                    required : '帐号不得为空！',
                    
                },
                pass:{
                    required:'密码不得为空',
                    minlength:'密码不的小于{0}位',
                   // remote : '帐号或密码不正确！',
                },
              

            }
    });


$('#reg_a').click(function(){
        $('#reg').dialog('open');
    });

    $('#reg').dialog({
         title:'知问注册',
         autoOpen:false,
         resizable:false,
         width:'340',
         hegiht:"340",
         modal:true,
         buttons : {
            '提交' : function () {

                $(this).submit();
            }
        },
     
    }).buttonset();//按钮链接在一起；

    $('#reg').validate({
            showErrors:function(errorMap,errorList){
                var error=this.numberOfInvalids();
                
                this.defaultShowErrors();

                if(error>0){
                    $('#reg').dialog('option','height',20*error+340);
                }else{
                    $('#reg').dialog('option','height',340);
                }
            }, 
            highlight:function(element,errorClass){
                // 当错误的时候
                $(element).css('border','1px solid #630');
                 $(element).parent().find('span').html('*').removeClass('succ');
            },
            unhighlight:function(element,errorClass){
                //当成功的时候~
                $(element).css('border','1px solid #ccc');
                $(element).parent().find('span').addClass('succ').html('&nbsp;');
            },
            
            submitHandler : function (form) {
                alert('');
                  
                var users=store.get('users') || [];

                for(var i=0;i<users.length;i++){
                    if(users[i].username==$('#reg #user').val()){
                        dialog.sad('用户已经存在！');
                        return;
                    }
                    if(users[i].email==$('#reg #email').val()){
                         dialog.sad('邮箱已经存在！');
                        return;
                    }

                }

                var u_temp={
                    username:$('#reg #user').val(),
                    password:$('#reg #pass').val(),
                    email:$('#reg #email').val(),
                    date :new Date().Format('yyyy-MM-dd H:i:s')
                };
               users.push(u_temp);
               store.set('users',users);
               dialog.smaile('注册成功！请登录');
               $('#reg').dialog('close');
                $('#reg').resetForm();
                 $('#reg span.star').html('*').removeClass('succ');
            },
            errorLabelContainer:'ol.reg_error',
            wrapper:'li',
            rules:{
                user:{
                   required : true,
                    minlength:2,
                    
                },
                pass:{
                    required:true,
                    minlength:6,
                },
                email:{
                    required:true,
                    email:true,
                },
                date:{
                    required:true,
                    date:true,
                },

            },
            messages:{
                user:{
                    
                    minlength:'账号不得小于{0}位',
                    required : '帐号不得为空！',
                    
                },
                pass:{
                    required:'密码不得为空',
                    minlength:'密码不的小于{0}位',
                },
                email:{
                    required:'邮箱不得为空',
                    email:'请输入正确的邮箱地址',
                },
                date:{
                    required:'生日不得为空',
                    date:'日期格式不正确',
                }

            }
    });
    $('#tabs').tabs();
    $('#accordion').accordion({
      
    });
});

Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
        }
