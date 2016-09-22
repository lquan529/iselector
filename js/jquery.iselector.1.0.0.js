;(function($, window, document, undefined) {

	/**
	 * [Iselector description]                   构造器
	 * @param {[type]} element [description]     dom父节点
	 * @param {[type]} options [description]     传入的各参数
	 */
	function Iselector(element, options) {
		this.options = $.extend({}, Iselector.defaults, options);
		this.$body = $('body');
		this.$element = $(element);
		this.init();
		this.event();
	}

	/**
	 * [defaults description]      定义传入的各参数
	 * @type {Object}			   排序和同列功能如果开启简写，就要传简写的名称
	 */
	Iselector.defaults = {
		dataJson: null,					//传入json数据
		sort: null,						//排序/省市合并输出同列,默认为空，不在排序  ['广东省', '北京市']传数字['440000', '110000']
		level: 1,						//有多少级联动;默认是1级联动
		shorthand: false,				//是否开启简写(默认是全称)
		iscode: null,					//是否开启输出区号的字段(默认不输出区号)：传入字段的name;例如： 'quhao';
		iscity: true,					//是否是用于城市下拉(默认是城市下拉)
		isvalue: true,					//input.value值存的是id还是name文本(默认是存id)
		iscustom: false,				//是否要自定义事件，用于自定义json的(默认是不开启)
		startClick: null,				//一开始点击的回调
		afterList: null					//点击li列表的回调
	};

	Iselector.prototype.init = function() {
		var self = this;
		var config = this.options;

		if(!config.dataJson){

			$.error("请检查JSON数据是否加载完毕。");

			return false;
		}

		/**
		 * [if description] 		是否排序
		 */
		if(config.iscity && config.sort) {
			this.$element.find('.selector-list').eq(0).html(self.jointHtml2(config.dataJson));

		}else {
			this.$element.find('.selector-list').eq(0).html(self.jointHtml(config.dataJson));
		}

	};

	Iselector.prototype.update = function(options) {
		var self = this;
		var config = options || this.options;

		this.$element.find('.selector-list').eq(0).html(self.jointHtml(config.dataJson));
	};

	Iselector.prototype.jointHtml = function (data, fpid) {
		/**
		 * 拼接html所存的变量
		 */
		var config = this.options,		//把参数用变量存起来
			fpid = fpid || '100000',	//城市：如果有传父级的id过来就用传过来的，否则就用默认的中国的id
			jstr = '',					//存拼接的html
			cstr = '';					//存在城市的html

		if (data) {
			/**
			 * 判断是否有传data数据，有就执行循环，没有就不做任何事
			 */
			$.each(data, function (jitem, jval) {
				/**
				 * 判断是否开启了简写，是就输出简写，否则就全称
				 * 判断json里面是否存在父id，存在就输出，不存在就为空
				 */
				var name = config.shorthand ? jval.shortName : jval.name;
				var code = config.iscode ? 'data-code="'+ jval.cityCode +'"' : '';
				var parentId = jval.parentId ? 'data-pid="'+ jval.parentId +'"' : '';
				/**
				 * [if description]		判断是否开启城市而且父id是不是为默认的100000
				 */
				if(config.iscity && jval.parentId === fpid){

					cstr += '<li data-id="'+ jval.id +'" data-nid="'+ jitem +'" '+ code +' '+ parentId +' data-name="'+ name +'">'+ name +'</li>';

				}else{

					jstr += '<li data-id="'+ jval.id +'" data-nid="'+ jitem +'" '+ code +' '+ parentId +' data-name="'+ name +'">'+ name +'</li>';

				}

			});

			//判断是否用于城市的
			if(config.iscity){return cstr;}

		}

		return jstr;
	};

	Iselector.prototype.jointHtml2 = function (data) {
		var config = this.options;
		var cstr = '';

		if(data) {
			for(var i = 0; i < config.sort.length; i++) {
				$.each(data, function(item, cval) {
					var name = config.shorthand ? cval.shortName : cval.name;
					var parentId = cval.parentId ? 'data-pid="'+ cval.parentId +'"' : '';
					var code = config.iscode ? 'data-code="'+ cval.cityCode +'"' : '';

					if(config.sort[i] === cval.id){
						cstr += '<li data-id="'+ cval.id +'" data-nid="'+ item +'" '+ code +' '+ parentId +' data-name="'+ name +'">'+ name +'</li>';
					}
				});
			}
		}

		return cstr;
	};

	Iselector.prototype.closeSelector = function (target) {
		var selectorLevel = target.parents('.selector-level');
		var sinput = selectorLevel.find('input');
		var _id = target.attr('data-id');
		var _name = target.data('name');
		var _code = target.attr('data-code');
		var _value = this.options.isvalue ? _id : _name;

		this.$element.find('.selector-name').removeClass('selector-name-dcolor');
		sinput.val(_value);
		target.addClass('checked').siblings('.checked').removeClass('checked');
		selectorLevel.find('.selector-name').text(_name);
		selectorLevel.find('.selector-list').addClass('none');

		if(this.options.iscode) {
			this.$body.find('input[name="'+ this.options.iscode +'"]').val(_code);
		}

		if (typeof this.options.afterList === 'function'){
			/**
			 * 点击列表的时候调用一个回调函数
			 * typeof 判断传进来的类型是不是一个function函数
			 * 返回三个参数 $self/target/this.options
			 */
			this.options.afterList.apply(this, [this.$element, target, this.options]);
		}
	};

	Iselector.prototype.event = function() {
		var self = this;
		var config = self.options;
		var $selector = self.$element;
		var $levelOne = $selector.find('.selector-level-1');
		var $levelTwo = $selector.find('.selector-level-2');
		var $levelThree = $selector.find('.selector-level-3');
		var $levelOneList = $levelOne.find('.selector-list');
		var $levelTwoList = $levelTwo.find('.selector-list');
		var $levelThreeList = $levelThree.find('.selector-list');

		//点击显示列表
		$selector.on('click.iselector', '.selector-name', function(event) {
			var $this = $(this);
			var $parent = $this.parent();
			self.$body.find('.selector-list').addClass('none');
			$parent.find('.selector-list').removeClass('none');

			if (typeof config.startClick === 'function'){
				/**
				 * 一开始点击的时候调用一个回调函数
				 * typeof 判断传进来的类型是不是一个function函数
				 * 返回三个参数 $self/_this/config
				 */
				config.startClick.apply(this, [self, $this, config]);
			}

			$(document).on('click.iselector', function(event) {
				self.$body.find('.selector-list').addClass('none');
			});
			event.stopPropagation();
		});

		//阻止冒泡
		$selector.on('click.iselector', function(event) {
			event.stopPropagation();
		});

		if(!config.iscustom) {

			//点击列表one
			$levelOneList.on('click.iselector', 'li', function(event) {
				var $this = $(this);
				var id = $(this).attr('data-id');
				var name = $(this).data('name');

				self.closeSelector($this);

				if(config.level > 1){

					$levelTwo.find('input').val('');

					$levelTwoList.html(self.jointHtml(config.dataJson, id));

					self.closeSelector($levelTwoList.find('li').eq(0));

				}

				if(config.level > 2){

					var _tid = $levelTwoList.find('li').eq(0).attr('data-id');

					$levelThree.find('input').val('');

					$levelThreeList.html(self.jointHtml(config.dataJson, _tid));

					self.closeSelector($levelThreeList.find('li').eq(0));

				}

			});

			//点击列表Two
			$levelTwoList.on('click.iselector', 'li', function (event) {
				var $this = $(this);
				var id = $this.attr('data-id');

				self.closeSelector($this);

				if (config.level > 2) {

					$levelThree.find('input').val('');

					$levelThreeList.html(self.jointHtml(config.dataJson, id));

					self.closeSelector($levelThreeList.find('li').eq(0));

				}

			});

			//点击列表Three
			$levelThree.on('click.iselector', 'li', function (event) {
				var $this = $(this);

				self.closeSelector($this);

			});
		}else {

			//点击li自定义事件
			$selector.on('click.iselector', 'li', function(event) {
				var $this = $(this);

				$selector.trigger('iclick.iselector', [config, $this]);
				$selector.find('li').removeClass('checked');
				$this.addClass('checked');
				$selector.find('.selector-list').addClass('none');

				if (typeof config.afterList === 'function'){
					/**
					 * 点击列表的时候调用一个回调函数
					 * typeof 判断传进来的类型是不是一个function函数
					 * 返回三个参数 $self/target/this.options
					 */
					config.afterList.apply(this, [$selector, $this, config]);
				}
			});
		}

	};

	$.fn.iselector = function (options) {
		return this.each(function() {
			if (!$(this).data('iselector')) {
				$(this).data('iselector', new Iselector(this, options));
			}
		});
	};

})(jQuery, window, document);