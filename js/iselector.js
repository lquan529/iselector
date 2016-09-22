/**
 * iselector  组件
 * dataJson 	[String]				传入json数据
 * container 	[String] 				父节点
 * template 	[String] 				自定义html模板
 * placeholder 	[String] 				列默认显示的文字
 * field 		[String] 				input的字段名 [省，市，区]
 * iscity 		[Boolean]				是否是用于城市下拉(默认是城市下拉)
 * iselect 		[Boolean]				是否用于select,默认是false，用于自定义
 * iscode		[Boolean]				是否输出区号值,默认false, 开启就传字段名，例如：'quhao'
 * isvalue 		[Boolean]				value存的是id 还是 name 默认true.是存id
 * shorthand 	[Boolean]				是否开启简写功能,默认不开启 false
 * level 		[Number]				多少列  默认是一列(级) 1
 * values 		[String]				返回选中的值
 * joinHtml 	[Function]				拼接html的函数，用于json数据自定义的，里面有4个传值
 										[data-json数据, pid-json数据的父id, level-列数（级数）, placeholder-默认显示的文字]
 * startClick	[Function] 				开始点击的回调函数
 */

/**
 * 关于 template
 * data-caller={{caller}} ： 必填，用于呼出下来列表，select时是change事件，自定义标签是click
 * data-item              ： 自定义标签时必填，因为【项】需要绑定click事件
 * role="name"            ： 自定义标签时必填，用于声明【name】 显示选中的选项名称
 * role="content"         ： 自定义标签时必填，用于声明【容器】 选项列表
 * role="input"			  :  自定义标签时必填，用于声明【input】隐藏域
 * name="{{field}}" 	  :  input字段名称，必填
 * 自定义的html
 	<div class="selector-level selector-level-{{level}}">
 		<a href="javascript:;" role="name" class="selector-name selector-name-dcolor" data-caller="{{caller}}">{{name}}</a>
 		<input type="hidden" name="{{field}}" role="input" value="">
 		<ul role="content" class="selector-list hide">{{content}}</ul>
 	</div>
 * 原生select-html
 	<select name="{{field}}" role="content" data-caller="{{caller}}" class="selector-control selector-control-{{level}}">{{content}}</select>
 */

;(function($, window, document, undefined) {

	/**
	 * [iSelector description]        			构造器
	 * @param {[type]} selector [description]   selector
	 * @param {[type]} options  [description]   参数
	 */
	function iSelector(selector, options) {
		this.options = $.extend({}, iSelector.defaults, options);
		this.$container = $(this.options.container);
		this.$selector = $(selector);
		this.init();
		this.event();
	}

	iSelector.defaults = {
		dataJson: null,
		container: 'body',
		template: '<div class="selector-level {{csname}} selector-level-{{level}}"><a href="javascript:;" role="name" class="selector-name selector-name-dcolor" data-caller="{{caller}}">{{name}}</a><input type="hidden" name="{{field}}" role="input" value=""><ul role="content" class="selector-list hide">{{content}}</ul></div>',
		placeholder: ['请选择省份', '请选择市', '请选择区'],
		field: ['userProvinceId', 'userCityId', 'userAreaId'],
		iscity: true,
		iselect: false,
		iscode: false,
		isvalue: true,
		shorthand: false,
		values: [],
		level: 1,
		joinHtml: function(data, pid, level, placeholder) {
			var _data = data;
			var _len = _data.length;
			var _pid = pid || '100000';
			var _html = this.options.iselect ? '<option>'+ placeholder +'</option>' : '';
			var _jhtml = this.options.iselect ? '<option>'+ placeholder +'</option>' : '';

			if( level < 0) {
				return _html;
			}

			for (var i = 0; i < _len; i++) {
				var _name = this.options.shorthand ? _data[i].shortName : _data[i].name;
				var _val = this.options.isvalue ? _data[i].id : _data[i].name;
				var _code = this.options.iscode && _data[i].cityCode !== "" ? 'data-code='+_data[i].cityCode : '';

				if (this.options.iscity && _data[i].parentId === _pid) {
					if (this.options.iselect) {
						_html += '<option data-item="'+ level +'" value="'+ _val +'">'+ _name +'</option>';
					}else {
						_html += '<li data-item="'+ level +'" data-id="'+ _data[i].id +'" '+ _code +'>'+ _name +'</li>';
					}
				} else {
					if (this.options.iselect) {
						_jhtml += '<option data-item="'+ level +'" value="'+ _val +'">'+ _name +'</option>';
					}else {
						_jhtml += '<li data-item="'+ level +'" data-id="'+ _data[i].id +'" '+ _code +'>'+ _name +'</li>';
					}
				}
			}

			if (this.options.iscity) {
				return _html;
			}

			return _jhtml;
		},
		startClick: null				//自定义标签一开始点击的回调
	};

	iSelector.prototype.init = function() {
		var self = this;
		var config = self.options;
		var html, placeholder, field;

		/**
		 * [for description]		定义的级别循环,添加html模板到对应的级别去
		 */
		for (var i = 0; i < config.level; i++) {

			//默认提示
			placeholder = config.placeholder[i] || '';

			//html模板把{{level}}和{{caller}}替换成对应的级别
			html = config.template.replace('{{level}}', i + 1).replace('{{caller}}', i + 1);

			if (!i) {
				html = html.replace('{{content}}', config.joinHtml.call(this, config.dataJson, null, i+1, placeholder));
			}else {
				html = html.replace('{{content}}', config.joinHtml.call(this, config.dataJson, null, -1, placeholder));
			}

			//自定义标签的时候会要求有这个{{name}},{{field}},要把这个替换成默认的显示文字
			if (html.indexOf('{{name}}') !== -1) {
				html = html.replace('{{name}}', placeholder);
			}

			//自定义标签的时候会要求有这个{{field}},要把这个替换成要传的字段名称
			if (html.indexOf('{{field}}') !== -1 || html.indexOf('{{csname}}') !== -1) {
				field = config.field[i] || '';
				html = html.replace('{{field}}', field).replace('{{csname}}', field);
			}

			//把html添加到对应的级别去
			self.$selector.append(html);

		}

	};

	iSelector.prototype.event = function() {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;

		/**
		 * 定义的级别循环,级别的事件处理
		 */
		for (var i = 0; i < config.level; i++) {

			(function(index) {
				var plusIndex = i + 1;

				//判断是否是select  是就用chage事件，否则就是click事件
				if (config.iselect) {

					$selector.on('change.iselector', '[data-caller="'+ plusIndex +'"]', function(event) {
						var $this = $(this);

						self.hideSelector($this, index, true);

					});

				} else {

					//显示列表
					$selector.on('click.iselector', '[data-caller="'+ plusIndex +'"]', function(event) {
						var $this = $(this);
						var $selectorList = $selector.find('[role="content"]');
						var _wh = window.innerHeight;
						var _sh = $selectorList.outerHeight();
						var _h = $this.outerHeight() + _sh;
						var _y = $this.offset().top + _h;

						//判断列表显示位置是否已经超出了可视区域，是就显示在上方
						if(_y + _h >= _wh) {
							$selectorList.removeAttr('style').css({
								'top': -_sh
							});
						}

						$selectorList.addClass('hide').eq(index).removeClass('hide');

						if (typeof config.startClick === 'function'){
							/**
							 * 一开始点击的时候调用一个回调函数
							 * typeof 判断传进来的类型是不是一个function函数
							 * 返回三个参数 $self/_this/config
							 */
							config.startClick.apply(this, [self, $this, config]);
						}

						return false;
					});

					//点击列表事件
					$selector.on('click.iselector', '[data-item="'+ plusIndex +'"]', function(event) {
						var $this = $(this);

						config.values = [];

						self.hideSelector($this, index, false);

					});
				}

			})(i);

		}

		//判断是否是用于自定义的
		if (!config.iselect) {
			//执行点击区域外的就隐藏列表;
			$(document).on('click.iselector', function (event){
	            var e = event || window.event;
	            var elem = e.target || e.srcElement;
	            while (elem) {
	                if (elem.className && elem.className.indexOf(self)>-1) {
	                    return;
	                }
	                elem = elem.parentNode;
	            }

	            self.$selector.find('[role="content"]').addClass('hide');
	        });

	    }

	};

	/**
	 * [hideSelector description]    					选项执行的函数
	 * @param  {[type]} tagert  [description]  			传点击的this
	 * @param  {[type]} index   [description] 			传循环的列数
	 * @param  {[type]} iselect [description] 			是否是select   true/false
	 */
	iSelector.prototype.hideSelector = function(tagert, index, iselect) {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;
		var $name = $selector.find('[role="name"]');
		var $caller = $selector.find('[data-caller]');
		var $input = $selector.find('[role="input"]');
		var $content = $selector.find('[role="content"]');
		var parentId = iselect ? tagert.val() : tagert.attr('data-id');
		var code = !config.iscode ? '' : tagert.data('code');
		var txt = tagert.text();
		var plusIndex = index + 1;
		var nextIndex = index + 2;
		var placeholder = config.placeholder[plusIndex] || '';

		/**
		 * [if description] 		判断是否是用于select，执行select事件，否则执行自定义的事件
		 * @param  {[type]} iselect [description]		是否是用于select
		 */
		if (iselect) {

			//默认提示
			placeholder = config.placeholder[plusIndex] || '';

			//添加下一列的选项
			$content.eq(plusIndex).html(config.joinHtml.call(self, config.dataJson, parentId, nextIndex, placeholder));

			//执行下一列的事件，然后选中第一个
			$content.eq(plusIndex).find('[data-item]').eq(0).prop('selected', true).trigger('change');

		} else {

			//添加选中的class
			tagert.addClass('checked').siblings('.checked').removeAttr('class');

			//添加选中的文字到name显示
			$name.eq(index).text(txt).removeClass('selector-name-dcolor');

			//添加选中的值到input里
			$input.eq(index).val(parentId);

			//判断是否开启区号，是的话就把选中的区号给值给这个区号的隐藏域去
			if(!config.iscode) {
				self.$container.find('input[name="'+ config.iscode +'"]').val(code);
			}

			//添加下一列的选项列表
			$content.eq(plusIndex).html(config.joinHtml.call(self, config.dataJson, parentId, nextIndex, placeholder));

			//执行下一列的点击事件，选中第一个
			$content.eq(plusIndex).find('[data-item]').eq(0).trigger('click');

			//隐藏对应的列表
			$content.eq(index).addClass('hide');

		}

		//返回选中的值
		config.values.unshift(parentId);

		//选择选项后触发自定义事件choose(选择)事件
		$selector.trigger('choose-' + plusIndex, [self, tagert, plusIndex, config.values]);

	};

	$.fn.iselector = function (options) {
		return this.each(function() {
			if (!$(this).data('iselector')) {
				$(this).data('iselector', new iSelector(this, options));
			}
		});
	};

})(jQuery, window, document);
