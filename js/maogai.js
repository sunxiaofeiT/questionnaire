/*
 * @Author: Pengfei.Sun 
 * @Date: 2018-05-20 16:09:48 
 * @Last Modified by: Pengfei.Sun
 * @Last Modified time: 2018-05-21 19:23:37
 */

var allQuestionsNumber = allQuestions.length; //题库中题目个数
var selectedQuestionsNumber = 3;
var selectedQuestions = addIdForSelectedQuestions(getRandomArrayElements(allQuestions,selectedQuestionsNumber)); //选中的题
var questionContent; //每个题的题目和选项
// var score;  //得分
var rightQuestions = []; //正确题目
var wrongQuestions = []; //错误题目

$(document).ready(function(){
    // 首页操作
    $('#startButton').on('click', function() {
        startButton()
    });

    // 答题相关操作
    var questionsNumber = selectedQuestionsNumber;
    var questionDom;
    // 增加答题卡
    addAllQuestiions(questionsNumber);
    // 切换答题卡
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
    $("#answer").answerSheet();
    $("#answer").trigger("create");
    // 监听题卡选项的点击
    listenOptionClick();
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
                        '<div class="card_bottom">'+ preButton +'<span><b>'+ number +'</b>/'+ allNumber +'</span></div>'+
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
    for (var i = 0; i< questionsNumber; i++) {
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
        console.log(selectedQuestions[questionId-1].status);
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
    questionDom.fadeOut('');
    var resultDom = $('#includeResult');
    resultDom.fadeIn('');
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
        questionId = elemId.substr(1,1); 
        value = elemId.substr(3);
        setScore(questionId,value);
        if(questionId == selectedQuestionsNumber) {
            var array = getScore(selectedQuestions);
            console.log('Did:',array[0],'. Undid:',array[1],'. Score:',array[2],'. Wrong:',array[3]);
            endButton();
            setResultInDom(array);
        }
    })
}

function setResultInDom(array) {
    if(array.length < 4) {
        console.log('将结果渲染到页面时出错,传入的数组长度错误');
    }else {
        $('#didNumber').html(array[0]);
        $('#undidNumber').html(array[1]);
        $('#rightNumber').html(array[2]);
        $('#wrongNumber').html(array[3]);
    }
}