;(function ( $, window, document, undefined ) {

	var iselector = $.fn.iselector = function (options) {
		/**
		 * 定义变量
		 */
		var settings = $.extend( {}, iselector.defaults, options ),
			method = arguments[0],
			$self = this;
			$body = $('body'),
			$levelOne = $self.find('.selector-level-1'),
			$levelTwo = $self.find('.selector-level-2'),
			$levelThree = $self.find('.selector-level-3'),
			$levelOneList = $levelOne.find('.selector-list'),
			$levelTwoList = $levelTwo.find('.selector-list'),
			$levelThreeList = $levelThree.find('.selector-list');

		/**
		 * 定义各函数
		 */
		var methods = {

			init: function (options) {

				var _self = this;

				if(!settings.dataJson){

					$.error("请检查JSON数据是否加载完毕。");

					return false;
				}

				$self.find('.selector-list').eq(0).html(methods.jointHtml(settings.dataJson));

			},
			update: function (options) {
				console.log(options)
			},
			jointHtml: function (data, fpid) {
				/**
				 * 拼接html所存的变量
				 */
				var fpid = fpid || '100000';	//城市：如果有传父级的id过来就用传过来的，否则就用默认的中国的id
				var jstr = '';					//存拼接的html
				var cstr = '';					//存在城市的html

				if (data) {
					/**
					 * 判断是否有传data数据，有就执行循环，没有就不做任何事
					 */
					$.each(data, function (jitem, jval) {

						var name = settings.shorthand ? jval.shortName : jval.name ;
						var parentId = jval.parentId ? 'data-pid="'+ jval.parentId +'"' : '';

						if(settings.iscity && jval.parentId === fpid){

							cstr += '<li data-id="'+ jval.id +'" data-nid="'+ jitem +'" '+ parentId +' data-name="'+ name +'">'+ name +'</li>';

						}else{

							jstr += '<li data-id="'+ jval.id +'" data-nid="'+ jitem +'" '+ parentId +' data-name="'+ name +'">'+ name +'</li>';

						}

					});

					if(settings.iscity){return cstr;}

				}

				return jstr;
			},
			closeSelector: function (target) {
				var selectorLevel = target.parents('.selector-level');
				var sinput = selectorLevel.find('input');
				var _id = target.attr('data-id');
				var _name = target.data('name');
				var _value = settings.isvalue ? _id : _name;

				$self.find('.selector-name').removeClass('selector-name-dcolor');
				sinput.val(_value);
				target.addClass('checked').siblings('.checked').removeClass('checked');
				selectorLevel.find('.selector-name').text(_name);
				selectorLevel.find('.selector-list').addClass('none');

				if (typeof settings.afterList === 'function'){
					/**
					 * 点击列表的时候调用一个回调函数
					 * typeof 判断传进来的类型是不是一个function函数
					 * 返回三个参数 $self/target/settings
					 */
					settings.afterList.apply(this, [$self, target, settings]);
				}
			}
		};

		/**
		 * 显示和隐藏列表
		 */
		$self.on('click.iselector', '.selector-name', function (event) {
			var _this = $(this);
			$self.find('.selector-list').addClass('none');
			_this.siblings('.selector-list').removeClass('none');

			if (typeof settings.startClick === 'function'){
				/**
				 * 一开始点击的时候调用一个回调函数
				 * typeof 判断传进来的类型是不是一个function函数
				 * 返回三个参数 $self/_this/settings
				 */
				settings.startClick.apply(this, [$self, _this, settings]);
			}

			return false;
		}).on('blur', function (event) {
			$self.find('.selector-list').addClass('none');
			return false;
		});

		/**
		 * 点击下拉区域以外的地方，就隐藏列表
		 */
		$(document).on('click.iselector', function (event){
            var e = event || window.event;
            var elem = e.target || e.srcElement;
            while (elem) {
                if (elem.className && elem.className.indexOf($self)>-1) {
                    return;
                }
                elem = elem.parentNode;
            }

            $self.find('.selector-list').addClass('none');
        });

		/**
		 * 点击li执行
		 */
		$levelOne.on('click.iselector', 'li', function (event) {
			var _this = $(this);
			var _id = _this.attr('data-id');

			methods.closeSelector(_this);

			if(settings.level > 1){

				$levelTwo.find('input').val('');

				$levelTwoList.html(methods.jointHtml(settings.dataJson, _id));

				methods.closeSelector($levelTwoList.find('li').eq(0));

			}

			if(settings.level > 2){

				var _tid = $levelTwoList.find('li').eq(0).attr('data-id');

				$levelThree.find('input').val('');

				$levelThreeList.html(methods.jointHtml(settings.dataJson, _tid));

				methods.closeSelector($levelThreeList.find('li').eq(0));

			}

		});

		$levelTwo.on('click.iselector', 'li', function (event) {
			var _this = $(this);
			var _id = _this.attr('data-id');

			methods.closeSelector(_this);

			if (settings.level > 2) {

				$levelThree.find('input').val('');

				$levelThreeList.html(methods.jointHtml(settings.dataJson, _id));

				methods.closeSelector($levelThreeList.find('li').eq(0));

			}
		});

		$levelThree.on('click.iselector', 'li', function (event) {
			var _this = $(this);

			methods.closeSelector(_this);
		});

		/**
		 * 开始所调用的函数还在有传入函数名
		 */
		if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.selectors Plugin');
            return this;
        }

        return method.apply(this, arguments);

	};

	iselector.defaults = {
		dataJson: null,				//传入json数据
		defaultArea: undefined,		//页面是否有给默认值
		level: 1,					//有多少级联动;默认是1级联动
		shorthand: false,			//是否开启简写(默认是全称)
		iscity: true,				//是否是用于城市下拉(默认是城市下拉)
		isvalue: true,				//value值存的是id还是name文本(默认是存id)
		startClick: null,			//一开始点击的回调
		afterList: null				//点击li列表的回调
	};

})( jQuery, window, document );