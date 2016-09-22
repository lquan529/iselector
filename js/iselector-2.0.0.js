(function($, window) {

	/**
	 * iselector-构造器
	 */
	function Iselector(options, selector) {
		this.options = $.extend({}, Iselector.defaults, options);
		this.$selector = $(selector);

		this.init();
		this.event();
	}

	/**
	 * iselector-配置参数
	 * type				[String]					组件是模拟还是原生，默认是模拟下拉(analog)，原生(select)
	 * datajson			[Json]						json数据/传(custom)就会认为是html定义列表数据
	 * container		[String]					组件执行的作用域，默认是(body)
	 * iscity			[Boolean]					组件是否用于城市，默认是用于城市(true)
	 * iscode			[Boolean]					配合城市使用，是否输出城市区号值，默认(false)，在隐藏域input加[role="code"]
	 * isvid			[Boolean]					提交给后台的值存的是数字(id)，还是文字(name)
	 * shorthand		[Boolean]					用于城市简写功能，默认是不开启(false)
	 * placeholder		[Array]						这个是配合原生select使用，默认提示语
	 * values			[Array]						返回选中的值
	 * notClass			[String]					禁止点击的class，配合datajson(custom)时要自定义html数据加一个标题不需要点击时使用
	 * level			[Number]					多少列  默认是一列/级 (1)
	 * onInitialized	[Attachable]				组件初始化后触发的回调函数
	 * onClicked		[Attachable]				点击组件后触发的回调函数
	 * choose-xx		[Attachable]				点击组件选项后触发的回调函数 xx(数字/级)是对应的级的回调
	 */
	Iselector.defaults = {
		type: 'analog',
		datajson: null,
		container: 'body',
		iscity: true,
		iscode: false,
		isvid: true,
		shorthand: false,
		placeholder: ['请选择省', '请选择市', '请选择区'],
		values: [],
		notClass: '.forbid',
		level: 3,
		onInitialized: null,
		onClicked: null
	};

	/**
	 * iselector-默认执行
	 */
	Iselector.prototype.init = function() {
		var self = this;
		var config = self.options;
		var $container = $(config.container);
		var $listInner = this.$selector.find('[role="list"]').eq(0);
		var isplaceholder = config.type === 'select' ? '<option>'+ config.placeholder[0] +'</option>' : '';

		if(config.datajson !== 'custom') {
			$listInner.html(isplaceholder + self.joinHtml(config.datajson, '100000'));
		}

		if (typeof config.onInitialized === 'function'){
			/**
			 * 一开始点击的时候调用一个回调函数
			 * typeof 判断传进来的类型是不是一个function函数
			 * 返回两个个参数 self/config
			 */
			config.onInitialized.apply(this, [self, config]);
		}

	};

	/**
	 * iselector-拼接li
	 */
	Iselector.prototype.joinHtml = function(data, pid) {
		var leng = data.length;
		var chtml = '',
			zhtml = '';

		//循环json数据，拼接li数据
		for(var i = 0; i < leng; i++) {
			var _name = this.options.shorthand ? data[i].shortName : data[i].name;
			var _val = this.options.isvid ? data[i].id : data[i].name;
			var _code = this.options.iscode && data[i].cityCode !== "" ? 'data-code=' + data[i].cityCode : '';


			if(this.options.iscity && data[i].parentId === pid) {
				//判断是模拟的还是原生的
				if(this.options.type === 'analog') {
					chtml += '<li data-id="'+ data[i].id +'" title="'+ _name +'" '+ _code +'>'+ _name +'</li>';
				}else {
					chtml += '<option value="'+ _val +'" '+ _code +'>'+ _name +'</option>';
				}
			}else {
				//判断是模拟的还是原生的
				if(this.options.type === 'analog') {
					zhtml += '<li data-id="'+ data[i].id +'" title="'+ _name +'">'+ _name +'</li>';
				}else {
					zhtml += '<option value="'+ _val +'">'+ _name +'</option>';
				}
			}
		}

		//判断是用于城市，是返回chtml，否则返回zhtml;
		if (this.options.iscity) {
			return chtml;
		}

		return zhtml;

	};

	/**
	 * iselector-事件
	 */
	Iselector.prototype.event = function() {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;

		for(var i = 0; i < config.level; i++) {
			(function(index) {
				var origIndex = i;
				var plusIndex = i + 1;
				var $listInner = $selector.find('[role="list"]').eq(origIndex);

				//模拟事件还是原生事件
				if(config.type === 'analog') {
					//显示列表选项
					$selector.on('click.iselector', '[role="name-'+ plusIndex +'"]', function(event) {
						var $this = $(this);

						self.show($this, plusIndex);

						return false;
					});

					//点击列表li事件
					$listInner.on('click.iselector', 'li:not('+ config.notClass +')', function(event) {
						var $this = $(this);
						var $parent = $this.parent();

						config.values = [];

						self.hide($this, plusIndex);
					});
				}else {
					$listInner.on('change.iselector', function(event) {
						var $this = $(this);

						config.values = [];

						self.hide($this, plusIndex);
					});
				}
			})(i);
		}

		if(config.type === 'analog') {
			//执行点击区域外的就隐藏列表;
			$(document).on('click.iselector', function (event){
	            var e = event || window.event;
	            var elem = e.target || e.srcElement;
	            while (elem) {
	                if (elem.className && elem.className.indexOf(self.$selector[0].className) > -1) {
	                    return;
	                }
	                elem = elem.parentNode;
	            }

	            $selector.find('[role="list"]').addClass('hide');
	        });
		}
	};

	/**
	 * iselector-显示
	 */
	Iselector.prototype.show = function(tagert, level) {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;

		$selector.find('[role="list"]').addClass('hide').eq(level - 1).removeClass('hide');

		if (typeof config.onClicked === 'function'){
			/**
			 * 一开始点击的时候调用一个回调函数
			 * typeof 判断传进来的类型是不是一个function函数
			 * 返回三个参数 self/tagert/config
			 */
			config.onClicked.apply(this, [self, tagert, config]);
		}

		//点击显示选项列表触发的事件
		$selector.trigger('show-' + level +'.iselector', [tagert, config]);
	};

	/**
	 * iselector-隐藏
	 */
	Iselector.prototype.hide = function(tagert, level) {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;
		var $parent = $(tagert).parent();

		$selector.find($parent).addClass('hide');

		this.obtain(tagert, level);

		//选择选项后触发自定义事件choose(选择)事件
		$selector.trigger('choose-' + level +'.iselector', [$selector, tagert, level, config]);
	};

	/**
	 * iselector-获取东西
	 */
	Iselector.prototype.obtain = function(tagert, level) {
		var self = this;
		var config = self.options;
		var $container = $(config.container);
		var $selector = self.$selector;
		var $tagert = $(tagert);
		var $istagert = config.type === 'analog' ? $tagert : $tagert.find('option:selected');
		var $parent = $tagert.parent();
		var pluslevel = level + 1;
		var id = config.type === 'analog' ? $tagert.attr('data-id') : $tagert.val();
		var title = config.type === 'analog' ? $tagert.attr('title') || $istagert.text() : $istagert.text();
		var val = config.isvid ? id : title;
		var code = !config.iscode ? '' : $istagert.data('code');

		$container.find('[role="code"]').val(code);

		//模拟、原生
		if(config.type === 'analog') {
			$parent.find('li').removeClass('checked');
			$tagert.addClass('checked');

			$selector.find('[role="name-'+ level +'"]').text(title);
			$container.find('[role="input-'+ level +'"]').val(val);

			//选中值执行下一级别的第一个选中
			if(config.datajson !== 'custom') {
				$selector.find('[role="list"]').eq(level).html(self.joinHtml(config.datajson, id)).scrollTop(0).find('li').eq(0).trigger('click');
			}else {
				$selector.find('[role="list"]').eq(level).find('li').eq(0).trigger('click');
			}
		}else {
			var isplaceholder = config.type === 'select' ? '<option>'+ config.placeholder[level] +'</option>' : '';

			$selector.find('[role="list"]').eq(level).html(isplaceholder + self.joinHtml(config.datajson, id)).find('option').prop('selected', false).eq(1).prop('selected', true).trigger('change');
		}

		//返回选中的值
		config.values.unshift(val);
	};

	/**
	 * iselector-更新json
	 */
	Iselector.prototype.update = function(json) {
		var self = this;
		var config = self.options;
		var $selector = self.$selector;
		var uhtml = '';

		if(json) {
			$selector.find('[role="list"]').eq(0).html(self.joinHtml(json));
		}
	};

	$.fn.iselector = function (options) {
		return this.each(function() {
			if (!$(this).data('iselector')) {
				$(this).data('iselector', new Iselector(options, this));
			}
		});
	};

})(jQuery, window);