/**
 * Created by Administrator on 2016/2/11.
 */
$(document).ready(function () {
    //侧边栏导航显示
    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active')
    });

    //Register: 失去焦点事件查询名称是否已被注册
    $("input#inputUsrName").blur(function () {
        var name = $("input#inputUsrName").val();
        //console.log("name:>> ", name);
        $.get("/findByName.do?name="+name, function (result) {
            //console.log("result:>> ", result.constructor);
            if(result.constructor==Object || name==""){
                $("span.errinfo").removeClass("corinfo");
                if(name==""){
                    $("span.errinfo").text("用户名称不能为空!");
                }else{
                    $("span.errinfo").text("此用户名称已被注册!");
                }
                $("input#inputPassword").attr({"disabled": "diabled"});
                $("input#inputRePasswd").attr({"disabled": "diabled"});
                $("button#submit").attr({"disabled": "diabled"});
            }
            else{
                $("span.errinfo").addClass("corinfo");
                $("span.errinfo").text("名称未被使用,请继续输入 ^_^");
                $("input#inputPassword").removeAttr("disabled");
                $("input#inputRePasswd").removeAttr("disabled");

            }
        });
    });

    //Register: 判断密码是否一致
    $("input#inputRePasswd").blur(function () {
        var pwd = $("input#inputPassword").val();
        var repwd = $("input#inputRePasswd").val();
        if(pwd != repwd){
            $("span.errinfo").removeClass("corinfo");
            $("span.errinfo").text("输入的用户密码不一致!");
            $("button#submit").attr({"disabled": "diabled"});
        }
        else{
            $("span.errinfo").addClass("corinfo");
            $("span.errinfo").text("信息已通过验证,请点击注册 ^_^");
            $("button#submit").removeAttr("disabled");
        }
    });

    //publish/edit：返回上一页
    $("button#cancel").click(function () {
        history.back(-1);
    });

    //KindEditor
    KindEditor.ready(function(K) {
        K.each({
            'plug-align' : {
                name : '对齐方式',
                method : {
                    'justifyleft' : '左对齐',
                    'justifycenter' : '居中对齐',
                    'justifyright' : '右对齐'
                }
            },
            'plug-order' : {
                name : '编号',
                method : {
                    'insertorderedlist' : '数字编号',
                    'insertunorderedlist' : '项目编号'
                }
            },
            'plug-indent' : {
                name : '缩进',
                method : {
                    'indent' : '向右缩进',
                    'outdent' : '向左缩进'
                }
            }
        },function( pluginName, pluginData ){
            var lang = {};
            lang[pluginName] = pluginData.name;
            KindEditor.lang( lang );
            KindEditor.plugin( pluginName, function(K) {
                var self = this;
                self.clickToolbar( pluginName, function() {
                    var menu = self.createMenu({
                        name : pluginName,
                        width : pluginData.width || 100
                    });
                    K.each( pluginData.method, function( i, v ){
                        menu.addItem({
                            title : v,
                            checked : false,
                            iconClass : pluginName+'-'+i,
                            click : function() {
                                self.exec(i).hideMenu();
                            }
                        });
                    })
                });
            });
        });
        K.create('textarea', {
            themeType : 'qq',
            items : [
                'bold','italic','underline','fontname','fontsize','forecolor','hilitecolor','plug-align','plug-order','plug-indent','link'
            ]
        });
    });

    //text-overflow hidden
    var $blogContent = $("div.blog-content");
    $blogContent.each(function(i) {
        var sContent = $(this).html(),
            $span = $("<span></span>"),
            $a = $("<a></a>");

        this.index = i;
        $span.html(sContent.substring(0, 100));
        $a.html(sContent.length > 150 ? '...' : '');
        $a.css({"text-decoration": "none"});
        $(this).html('');
        $(this).append($span);
        $(this).append($a);
    });
});

