/*
 * @Author: Pengfei.Sun 
 * @Date: 2018-05-20 16:09:48 
 * @Last Modified by: pengfei.SUN
 * @Last Modified time: 2018-05-28 19:05:52
 */

var usersApi = 'http://localhost:3000/users';
var questionsApi = 'http://localhost:3000/questions';
// var usersApi = 'http://123.206.227.133:3000/users';
// var questionsApi = 'http://123.206.227.133:3000/questions';
var allQuestions;
var users;
var allQuestionsNumber; //题库中题目个数
var selectQuestionsNumber = 5;
var questionContent; //每个题的题目和选项
var rightQuestions = []; //正确题目
var wrongQuestions = []; //错误题目
var levelValue = 0; // 难度系数
var levelText = '简单'; //难度
var user = {};
user.userName = '';
user.userEmail = '';;

$.ajax({
    url: usersApi,
    type: 'GET',
    dataType: 'json',
    async: false,
    success: function (response) {
        users = response;
    },
    error: function(response) {
        console.log(response);
    }
})
$.ajax({
    url: questionsApi,
    type: 'GET',
    async: false,
    dataType: 'json',
    success: function (response) {
        allQuestions = response;
        allQuestionsNumber = allQuestions.length;
    },
    error: function (response) {
        console.log('ajax get questions wrong, message: ' + response);
    }
})
var selectedQuestions = addIdForSelectedQuestions(getRandomArrayElements(allQuestions,selectQuestionsNumber)); //选中的题

// console.log(allQuestions,users);

$(document).ready(function(){
    layui.use(['layer','form'],function () {
        var layer = layui.layer;
        var form = layui.form;

        // 开始答题
        $('#startButton').on('click', function() {
            if( user.userName == null || user.userName == ''){
                layer.msg('请先点击个人信息填写信息！', {'time':'1000'});
            }else {
                setQuestionsNumber(levelValue);
                console.log('selectQuestionsNumber:' + selectQuestionsNumber);
                selectedQuestions = addIdForSelectedQuestions(getRandomArrayElements(allQuestions,selectQuestionsNumber));
                addAllQuestiions(selectQuestionsNumber);  //向页面中增加题目
                $("#answer").answerSheet();
                $("#answer").trigger("create");
                setTimer();// 计时器
                startButton()
                layer.msg('当前难度为:' + levelText, {'time':'1000'});
                // 监听题卡选项的点击
                listenOptionClick();            
            }
        });
        
        // 难度选择
        $('#selectLevel').on('click',function () {
            selectLevel();
        })

        // 设置个人资料
        $('.setUserInfoButton').on('click', function () {
            layer.open({
                type: 1,
                title: '设置用户信息',
                content: $('#userInfo'),
                area: ['250px','300px'],
                btn: ['确认','取消'],
                btnAlign: 'c',
                btn1: function(index) {
                    if( $('#userName').val() == '') {
                        layer.msg('请输入个人信息！');
                    }else {
                        setUserInfo();
                        layer.close(index);
                    }
                },
                btn2: function (index) {
                    layer.close(index);
                }
            })
        })

        // 打开排行榜
        $('.ranking').on('click',function() {
            setRankingDom(users);
            var shouye = $('#includeStart');
            var ele = $('#rankingListDiv');
            shouye.hide();
            ele.fadeIn();
        })
        
        // 答题相关操作
        var questionDom;
        // 增加答题卡
        addAllQuestiions(selectQuestionsNumber);

        // 切换答题卡
        $("#answer").answerSheet();
        $("#answer").trigger("create");

        // 监听题卡选项的点击
        // listenOptionClick();

        // 结果页返回首页
        $('#returnHome').on('click',function () {
            console.log('return to home page');
            $('#includeResult').fadeOut();
            location.reload();
        })

        // 重新挑战
        $('#scoreText').on('click',function () {
            $('#timeText').html('00 min 00 sec');
            clearTime(timecount);
            setTimer();
            layer.msg('重新挑战 ！',{ 'time':'800'});
            resetQuestions();
            $('#includeResult').hide();
            $('#includeAnswer').fadeIn();
        })

        // 排行榜页面返回首页
        $('.rankingButton').on('click',function() {
            $('#rankingListDiv').hide();
            $('#includeStart').fadeIn();
        })

        // 说明
        $('.shuoming').on('click',function() {
            layer.open({
                type: 1,
                title: '说明',
                area: ['300px', '550px'],
                content: $('#shuoming'),
                btn: ['我知道了'],
                btnAlign: 'c',
                btn1: function (index) {
                    layer.close(index);
                }
            })
        })
    })
        
    $.fn.answerSheet = function (options) {
        var defaults = {
            mold: 'card',
        };
        var opts = $.extend({}, defaults, options);
        return $(this).each(function () {
            var obj = $(this).find('.card_cont');
            var _length = obj.length,
                _b = _length - 1,
                _len = _length - 1,
                _cont = '.card_cont';
            for (var a = 1; a <= _length; a++) {
                obj.eq(_b).css({
                    'z-index': a
                });
                _b -= 1;
            }
            $(this).show();
            if (opts.mold == 'card') {
                obj.find('ul li label').on('click',function () {
                    var _idx = $(this).parents(_cont).index(),
                        _cards = obj,
                        _cardcont = $(this).parents(_cont);
                    if (_idx == _len) {
                        return;
                    } else {
                        setTimeout(function () {
                            _cardcont.addClass('cardn');
                            setTimeout(function () {
                                _cards.eq(_idx + 3).addClass('card3');
                                _cards.eq(_idx + 2).removeClass('card3').addClass('card2');
                                _cards.eq(_idx + 1).removeClass('card2').addClass('card1');
                                _cardcont.removeClass('card1');
                            }, 200);
                        }, 100);
                    }
                });
                $('.card_bottom').find('.prev').on('click',(function () {
                    var _idx = $(this).parents(_cont).index(),
                        _cardcont = $(this).parents(_cont);
                    obj.eq(_idx + 2).removeClass('card3').removeClass('cardn');
                    obj.eq(_idx + 1).removeClass('card2').removeClass('cardn').addClass('card3');
                    obj.eq(_idx).removeClass('card1').removeClass('cardn').addClass('card2');
                    setTimeout(function () {
                        obj.eq(_idx - 1).addClass('card1').removeClass('cardn');
                    }, 200);
                }));
            }
        });
    };
})

/**
 * 增加一个答题卡
 * 
 * @param {string} allNumber 
 * @param {string} number 
 * @param {string} classNumber 
 * @param {string} array 
 * @param {string} preButton 
 * @returns DOM元素的string
 */
function addQuestion(allNumber,number,classNumber,array,preButton) {
    var questionDom;
    if (array !=null && array.optionOne != null && array.optionTwo != null) {
        questionDom = '<div class="card_cont '+ classNumber +'">' +
        '<div class="card">' +
        '<p class="question"><span>Q'+ number +'、</span>'+ array.subject +'</p>' +
        '<ul class="select">'+
        '<li>'+
        '<input id="q'+ number +'_1" class="option" type="radio" name="r-group-'+ number +'" >'+
        '<label for="q'+ number +'_1">'+ array.optionOne +'</label>'+
        '</li>'+
        '<li>'+
        '<input id="q'+ number +'_2" class="option" type="radio" name="r-group-'+ number +'">'+
        '<label for="q'+ number +'_2">'+ array.optionTwo +'</label>'+ 
        '</li>';
        if( array.optionThree != null) {
            questionDom += '<li>'+
                            '<input id="q'+ number +'_3" class="option" type="radio" name="r-group-'+ number +'">'+
                            '<label for="q'+ number +'_3">'+ array.optionThree +'</label>'+
                            '</li>';
        };
        if( array.optionFour != null) {
            questionDom += '<li>'+
                            '<input id="q'+ number +'_4" class="option" type="radio" name="r-group-'+ number +'">'+
                            '<label for="q'+ number +'_4">'+ array.optionFour +'</label>'+
                            '</li>';
        };
        if (array.optionFive != null) {
            questionDom += '<li>'+
                            '<input id="q'+ number +'_5" class="option" type="radio" name="r-group-'+ number +'">'+
                            '<label for="q'+ number +'_5">' + array.optionFive +'</label>'+
                            '</li>';
        };
        questionDom += '</ul>'+ 
                        '<div class="card_bottom">'+ preButton +'<span><b>'+ number +'</b>/<p>'+ allNumber +'</p></span></div>'+
                        '</div>'+
                        '</div>';
    }
    // console.log('add function:', questionDom);
    return questionDom;
}
/**
 * 根据传入的参数增加所有的题目
 * 
 * @param {string} questionsNumber 本次答题的题目的数量
 */
function addAllQuestiions(questionsNumber) {
    var ele = $('.card_cont');
    // console.log(ele.length,questionsNumber);
    // questionsNumber -= ele.length;
    for (var i = ele.length; i< questionsNumber; i++) {
        questionContent = selectedQuestions[i];
        var classNumber,preButton;
        if ( i == 0 ){
            preButton = '';
            classNumber = 'card' + (i+1);            
            questionDom = addQuestion(questionsNumber,(i+1).toString(),classNumber,questionContent,preButton);            
        }else if (i < 3){
            preButton = '<a class="prev">上一题</a>';
            classNumber = 'card' + (i+1);
            questionDom = addQuestion(questionsNumber,(i+1).toString(),classNumber,questionContent,preButton);
        }else {
            preButton = '<a class="prev">上一题</a>';            
            classNumber = '';
            questionDom = addQuestion(questionsNumber,(i+1).toString(),classNumber,questionContent,preButton);
        };
        $('#answer').append(questionDom);
    };
    $('.card_bottom p').html(questionsNumber);    
}
/**
 * 随机获取数组中的几个元素
 * 
 * @param {array} array 源数组 
 * @param {number} number 从源数组中取出元素的个数
 * @returns 取出元素的数组
 */
function getRandomArrayElements(array, number) {
    var shuffled = array.slice(0), i = array.length, min = i - number, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
/**
 * 判断选择是否正确,并根据是否争取存入对应数组,
 * 并在selsectedQuestions对象数组的每个对象加上status属性
 * right 和 wrong
 * 
 * @param {string} questionId 问题的Id
 * @param {string} value 选中的值
 */
function setScore(questionId,value){
    if (selectedQuestions[questionId-1].answer == value) {
        rightQuestions.push(selectedQuestions[questionId-1]);
        selectedQuestions[questionId-1].status = 'right';
        console.log(selectedQuestions[questionId-1].status);
    }else  {
        wrongQuestions.push(selectedQuestions[questionId-1]);
        selectedQuestions[questionId-1].status = 'wrong';        
        // console.log(selectedQuestions[questionId-1].status);
    }
}
/**
 * 给选中题库的加一个顺序排列的属性
 * 
 * @param {array} selectedQuestions
 * @returns {array} 增加了Id属性的选中的题库
 */
function addIdForSelectedQuestions(selectedQuestions) {
    for (var i = 0; i < selectedQuestions.length; i++) {
        selectedQuestions[i].id = (i);
    }
    return selectedQuestions;
}
/**
 * 点击开始按钮事件
 * 
 */
function startButton() {
    var shouye = $('#includeStart');
    var ele = $('#includeAnswer');
    shouye.fadeOut();
    setTimeout(()=> {
        ele.fadeIn("");
    },200)
}
/**
 * 答题结束调用此方法,展示结果,隐藏答题卡
 * 
 */
function endButton() {
    var questionDom = $('#includeAnswer');
    questionDom.hide();
    var resultDom = $('#includeResult');
    resultDom.fadeIn();
}
/**
 * 判断题目完成情况,计算已做和未做的,以及得分情况
 * 
 * @param {array} selectedQuestions 
 * @returns [did,undid,score,wrong]
 */
function getScore(selectedQuestions) {
    var score = 0;
    var wrong = 0;
    var did = 0;
    var undid = 0;
    for(var i = 0; i < selectedQuestions.length; i++) {
        if (selectedQuestions[i].status == null) {
            undid ++;
        }else if(selectedQuestions[i].status == 'right'){
            score ++;
            did ++;
        }else {
            wrong ++;
            did ++;     
        } 
    }
    return [did,undid,score,wrong];
}
/**
 * 监听每道题的选项的点击事件
 * 
 */
function listenOptionClick() {
    $('.option').on('click',function() {
        var elemId, questionId,value;
        elemId = $(this).attr('id');
        // console.log(elemId.length);
        if(elemId.length > 4){
            questionId = elemId.substr(1,2); 
        }else {
            questionId = elemId.substr(1,1);             
        }
        value = elemId.substr(3);
        // console.log(questionId,selectQuestionsNumber);
        setScore(questionId,value);
        if(questionId == selectQuestionsNumber) {
            clearTime(timecount); //清楚时间
            var array = getScore(selectedQuestions);
            console.log('Did:',array[0],'. Undid:',array[1],'. Score:',array[2],'. Wrong:',array[3]);
            var params = {};
            params.id = user.id;
            params.userName = user.userName;
            params.userEmail = user.userEmail;
            params.score = (array[2] * 10);
            params.time = $('#timeText').html();
            $.ajax({
                url: usersApi + '/' + user.id,
                type: 'PUT',
                contentType: 'application/x-www-form-urlencoded',
                data: params,
                async: false,
                success: function () {
                    console.log('增加分数成功！');
                },
                error: function (response) {
                    console.log('增加分数失败，message: ' + response);
                }
            })
            endButton();
            setResultInDom(array);
        }
    })
}
/**
 * 将答题结果情况渲染到页面上
 * 
 * @param {any} array 
 */
function setResultInDom(array) {
    if(array.length < 4) {
        console.log('将结果渲染到页面时出错,传入的数组长度错误');
    }else {
        $('#didNumber').html(array[0]);
        $('#undidNumber').html(array[1]);
        $('#rightNumber').html(array[2]); //得分
        $('#score h2').html(array[2]*10);
        $('#wrongNumber').html(array[3]);
    }
}
/**
 * 选择难度函数，弹窗选择难度，设置全局参数 levelValue
 * 
 */
function selectLevel () {
    var value, text;
    layer.open({
        type: '1',
        title: '选择你要挑战的难度',
        content: $('#setDiff'),
        area: ['80%','50%'],
        btn: ['确认'],
        btnAlign: 'c',
        btn1: (index) => {
            value = $('#levelSelect').val();
            if( value == 0) {
                text = '简单';
            }else if (value == 1) {
                text = '普通';
            }else if(value == 2) {
                text = '困难';
            }else if(value = 3){
                text = '极难';
            }
            layer.msg('你选择了 "' + text + '" 难度', {'time':'1000'});
            levelValue = value;
            levelText = text;
            console.log('you chose the level', value);
            layer.close(index);
        }
    })
}
/**
 * 根据传入的难度值设置本次答题的题目个数
 * 
 * @param {any} levelValue 难度系数 0=》简单，1=》普通，2=》困难，3=》极难
 */ 
function setQuestionsNumber(levelValue) {
    if (levelValue == 0) {
        selectQuestionsNumber = 5;    //简单
    }else if (levelValue == 1) {
        selectQuestionsNumber = 10;   //普通
    }else if(levelValue == 2) {
        selectQuestionsNumber = 20; // 困难
    }else if(levelValue == 3) {
        selectQuestionsNumber = 30;  //极难
    }else {
        console.log('levelValue is illegal!. Please choose a diff level!');
        layer.msg('请选择一个难度！', {'time':'1000'});
    }
}
/**
 * 重置答题卡的顺序，恢复到原始位置，以便于重新挑战
 * 
 */
function resetQuestions() {
    var elem = $('.card_cont');
    console.log(elem[0]);
    for (var i = 0; i < elem.length; i++) {
        if( elem[i].classList.contains('cardn')) {
            elem[i].classList.remove('cardn');
        }else if( elem[i].classList.contains('card1') ) {
            elem[i].classList.remove('card1');
        }else if( elem[i].classList.contains('card2') ) {
            elem[i].classList.remove('card2');
        }
        if( i < 3) {
            elem[i].classList.add('card'+(i+1));
        }
    }
}
/**
 * 点击个人信息页面的确定按钮后执行的事件
 * 主要是增加一个新的用户
 * 
 */
function setUserInfo() {
    var name = $('#userName').val();
    var email = $('#userEmail').val();
    user.userName = name;
    user.userEmail = email;
    if (user.id == null){
        user.id = users.length + 1;
        users.push(user);
        var params = {};
        params.id = users.length + 1;
        params.userName = name;
        params.userEmail = email;
        $.ajax({
            url: usersApi,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            data: params,
            async: false,
            success: function (response) {
                users = getAjax(usersApi);
                user = response;
                // console.log(response);
            },
            error: function () {
                layer.msg('新增用户失败，请重试！');
            }
        })     
    }else {
        // users[user.id-1].userName = name;
        // users[user.id-1].userEmail = email;
        var params = {};
        params.userName = name;
        params.userEmail = email;
        $.ajax({
            url: usersApi + '/' + user.id,
            type: 'PUT',
            contentType: 'application/x-www-form-urlencoded',
            data: params,
            success: function (response) {
                users = getAjax(usersApi);
            },
            error: function (response) {
                layer.msg('修改用户信息失败，请重试！');
            }
        })
    }
    layer.msg('欢迎：' + user.userName + ' !', {'time':'800'});
}

function getAjax (api) {
    var res; 
    $.ajax({
        url: api,
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function(response){
            console.log(response);
            res = response;
            return response;
        },
        error: function (response) {
            console.log('get function wrong')
        }
    })
    return res;
}
/**
 * 根据分数对对象数组进行从打到小的排序
 * 
 * @param {arry} array 对象数组
 * @returns 排序后的数组
 */
function sortScore(array) {
    for (var i = 0; i < array.length; i++) {
        for(var j = i+1; j < array.length; j++ ) {
            if(array[i].score < array[j].score) {
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }else if (array[i].score == array[j].score) {
                if(array[i].time > array[j].time) {
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }
        }
    }
    return array
}
/**
 * 动态增加排名
 * 
 * @param {any} array 
 */
function setRankingDom (array) {
    var eachName;
    var array = sortScore(array);
    for (var i = 0; i < array.length; i++) {
        if(array[i].score != null && array[i].time != null){
            eachName = '<div class="rankingEachName">'+
            '<!-- 排行榜头像 -->'+
            '<div class="rankingImgDiv">'+
            '<img id="rankingTouxiang" src="./img/touxiang.jpg">'+
            '</div>'+
            '<div class="rankingInfoDiv">'+
            '<h4>'+array[i].userName+'</h4>'+
            '<p>得分:<span id="rankingScore">'+array[i].score+'</span>分。 用时:<span id="rankingTime">'+array[i].time+'</span></p>'+
            '</div>'+
            '</div>'+
            '<hr>';
            $('#rankingListName').append(eachName);
        }
    }
}

var timecount;
function setTimer() {
    timecount = null;
    if (timecount != null) {
    } else {
        var times = 1;
        timecount = window.setInterval(function () {
            var hour, min, sec;
            if (times < 60) {
                hour = 0;
                min = 0;
                sec = times;
                $('#timeText').html(numToStr(min) + ' min ' + numToStr(sec) + ' sec');
            } else if (times < 3600) {
                hour = 0;
                min = Math.floor(times / 60);
                sec = times - min * 60;
                $('#timeText').html(numToStr(min) + ' min ' + numToStr(sec) + ' sec');
            } else if (times < 3600 * 60) {
                hour = Math.floor(times / 3600);
                min = Math.floor((times - hour * 3600) / 60);
                sec = times - hour * 3600 - mini * 60;
                $('#timeText').html(numToStr(hour) + ' hour ' + numToStr(min) + ' min');
            } else {
                times = 0;
                hour = 0;
                min = 0;
                sec = 0;
                $('#timeText').html(numToStr(min) + ' min ' + numToStr(sec) + ' sec');
            }
            times++;
        }, 1000)
    }
};
function clearTime(e) {
    clearInterval(e);
}
function numToStr(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return '' + num;
    }
}