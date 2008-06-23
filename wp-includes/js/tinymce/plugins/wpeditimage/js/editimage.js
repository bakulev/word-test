
var tinymce = null, tinyMCEPopup, tinyMCE;

tinyMCEPopup = {
	init: function() {
		var t = this, w, ti, li, q, i, it;

		li = ('' + document.location.search).replace(/^\?/, '').split('&');
		q = {};
		for (i=0; i<li.length; i++) {
			it = li[i].split('=');
			q[unescape(it[0])] = unescape(it[1]);
		}

		if (q.mce_rdomain)
			document.domain = q.mce_rdomain;

		// Find window & API
		w = t.getWin();
		tinymce = w.tinymce;
		tinyMCE = w.tinyMCE;
		t.editor = tinymce.EditorManager.activeEditor;
		t.params = t.editor.windowManager.params;

		// Setup local DOM
		t.dom = t.editor.windowManager.createInstance('tinymce.dom.DOMUtils', document);
		t.editor.windowManager.onOpen.dispatch(t.editor.windowManager, window);
	},

	getWin : function() {
		return window.dialogArguments || opener || parent || top;
	},

	getParam : function(n, dv) {
		return this.editor.getParam(n, dv);
	},

	close : function() {
		var t = this, win = t.getWin();

		
		// To avoid domain relaxing issue in Opera
		function close() {
			win.tb_remove();
			t.editor.execCommand('mceRepaint');
			tinymce = tinyMCE = t.editor = t.params = t.dom = t.dom.doc = null; // Cleanup
		};

		if (tinymce.isOpera)
			win.setTimeout(close, 0);
		else
			close();
	},

	execCommand : function(cmd, ui, val, a) {
		a = a || {};
		a.skip_focus = 1;

		this.restoreSelection();
		return this.editor.execCommand(cmd, ui, val, a);
	},

	storeSelection : function() {
		this.editor.windowManager.bookmark = tinyMCEPopup.editor.selection.getBookmark('simple');
	},

	restoreSelection : function() {
		var t = tinyMCEPopup;

		if (tinymce.isIE)
			t.editor.selection.moveToBookmark(t.editor.windowManager.bookmark);
	}
}
tinyMCEPopup.init();

var wpImage = {
	preInit : function() {
		// import colors stylesheet from parent
		var win = tinyMCEPopup.getWin();
		var styles = win.document.styleSheets;

		for ( i = 0; i < styles.length; i++ ) {
			var url = styles.item(i).href;
			if ( url && url.indexOf('colors-') != -1 )
				document.write( '<link rel="stylesheet" href="'+url+'" type="text/css" media="all" />' );
		}
	},

	I : function(e) {
		return document.getElementById(e);
	},

	current : '',
	link : '',
	link_rel : '',
	target_value : '',
	current_size_sel : 's100',
	width : '',
	height : '',

	setTabs : function(tab) {
		var t = this;

		if ( 'current' == tab.className ) return false;
		t.I('div_advanced').style.display = ( 'tab_advanced' == tab.id ) ? 'block' : 'none';
		t.I('div_basic').style.display = ( 'tab_basic' == tab.id ) ? 'block' : 'none';
		t.I('tab_basic').className = t.I('tab_advanced').className = '';
		tab.className = 'current';
		return false;
	},

	img_seturl : function(u) {
		var t = this, rel = t.I('link_rel').value;

		if ( 'current' == u ) {
			t.I('link_href').value = t.current;
			t.I('link_rel').value = t.link_rel;
		} else {
			t.I('link_href').value = t.link;
			if ( rel ) {
				rel = rel.replace( /attachment|wp-att-[0-9]+/gi, '' );
				t.I('link_rel').value = tinymce.trim(rel);
			}
		}
	},

	imgAlignCls : function(v) {
		var t = this, cls = t.I('img_classes').value;

		t.I('img_demo').className = v;

		cls = cls.replace( /align[^ "']+/gi, '' );
		cls += (' ' + v);
		cls = cls.replace( /\s+/g, ' ' ).replace( /^\s/, '' );

		if ( 'aligncenter' == v ) {
			t.I('hspace').value = '';
			t.updateStyle('hspace');
		}
		
		t.I('img_classes').value = cls;
	},

	showSize : function(el) {
		var t = this, demo = t.I('img_demo'), w = t.width, h = t.height, id = el.id || 's100', size;

		size = parseInt(id.substring(1)) / 200;
		demo.width = Math.round(w * size);
		demo.height = Math.round(h * size);

		t.showSizeClear();
		el.style.borderColor = '#A3A3A3';
		el.style.backgroundColor = '#E5E5E5';
	},

	showSizeRem : function() {
		var t = this, demo = t.I('img_demo'), f = document.forms[0];

		demo.width = Math.round(f.width.value * 0.5);
		demo.height = Math.round(f.height.value * 0.5);
		t.showSizeClear();
		t.I(t.current_size_sel).style.borderColor = '#A3A3A3';
		t.I(t.current_size_sel).style.backgroundColor = '#E5E5E5';

		return false;
	},

	showSizeClear : function() {
		var divs = this.I('img_size').getElementsByTagName('div');

		for ( i = 0; i < divs.length; i++ ) {
			divs[i].style.borderColor = '#f1f1f1';
			divs[i].style.backgroundColor = '#f1f1f1';
		}
	},

	imgEditSize : function(el) {
		var t = this, f = document.forms[0], sz, m = null;

		var W = parseInt(t.preloadImg.width), H = parseInt(t.preloadImg.height), w = t.width || W, h = t.height || H, id = el.id || 's100';

		if ( ! t.preloadImg || W == "" || H == "" )
			return;

		size = parseInt(id.substring(1)) / 100;

		w = Math.round(w * size);
		h = Math.round(h * size);

		f.width.value = Math.min(W, w);
		f.height.value = Math.min(H, h);

		t.current_size_sel = id;
		t.demoSetSize();
	},

	demoSetSize : function(img) {
		var demo = this.I('img_demo'), f = document.forms[0];

		demo.width = f.width.value ? Math.floor(f.width.value * 0.5) : '';
		demo.height = f.height.value ? Math.floor(f.height.value * 0.5) : '';
	},

	demoSetStyle : function() {
		var f = document.forms[0], demo = this.I('img_demo'), dom = tinyMCEPopup.editor.dom;

		if (demo) {
			dom.setAttrib(demo, 'style', f.img_style.value);
			dom.setStyle(demo, 'width', '');
			dom.setStyle(demo, 'height', '');
		}
	},

	origSize : function() {
		var t = this, f = document.forms[0], el = t.I('s100');

		f.width.value = t.width = t.preloadImg.width;
		f.height.value = t.height = t.preloadImg.height;
		t.demoSetSize();
		t.showSize(el);
	},

	init : function() {
		var ed = tinyMCEPopup.editor, h;

		h = document.body.innerHTML;

		// Replace a=x with a="x" in IE
		if (tinymce.isIE)
			h = h.replace(/ (value|title|alt)=([^"][^\s>]+)/gi, ' $1="$2"')

		document.body.innerHTML = ed.translate(h);
		window.setTimeout( function(){wpImage.setup();}, 100 );
	},

	setup : function() {
		var t = this, h, c, el, id, link, fname, f = document.forms[0], ed = tinyMCEPopup.editor, d = t.I('img_demo'), dom = tinyMCEPopup.dom;
		document.dir = tinyMCEPopup.editor.getParam('directionality','');
		tinyMCEPopup.restoreSelection();
		el = ed.selection.getNode();
		if (el.nodeName != 'IMG') return;

		f.img_src.value = d.src = link = ed.dom.getAttrib(el, 'src');
		ed.dom.setStyle(el, 'float', '');

		f.img_title.value = ed.dom.getAttrib(el, 'title');
		f.img_alt.value = ed.dom.getAttrib(el, 'alt');
		f.border.value = ed.dom.getAttrib(el, 'border');
		f.vspace.value = ed.dom.getAttrib(el, 'vspace');
		f.hspace.value = ed.dom.getAttrib(el, 'hspace');
		f.align.value = ed.dom.getAttrib(el, 'align');
		f.width.value = t.width = ed.dom.getAttrib(el, 'width');
		f.height.value = t.height = ed.dom.getAttrib(el, 'height');
		f.img_classes.value = c = ed.dom.getAttrib(el, 'class');
		f.img_style.value = ed.dom.getAttrib(el, 'style');

		// Move attribs to styles
		if (dom.getAttrib(el, 'hspace'))
			t.updateStyle('hspace');

		if (dom.getAttrib(el, 'border'))
			t.updateStyle('border');

		if (dom.getAttrib(el, 'vspace'))
			t.updateStyle('vspace');

		if (pa = ed.dom.getParent(el, 'A')) {
			f.link_href.value = t.current = ed.dom.getAttrib(pa, 'href');
			f.link_title.value = ed.dom.getAttrib(pa, 'title');
			f.link_rel.value = t.link_rel = ed.dom.getAttrib(pa, 'rel');
			f.link_style.value = ed.dom.getAttrib(pa, 'style');
			t.target_value = ed.dom.getAttrib(pa, 'target');
			f.link_classes.value = ed.dom.getAttrib(pa, 'class');
		}

		f.link_target.checked = ( t.target_value && t.target_value == '_blank' ) ? 'checked' : '';

		fname = link.substring( link.lastIndexOf('/') );
		fname = fname.replace(/-[0-9]{2,4}x[0-9]{2,4}/, '' );
		t.link = link.substring( 0, link.lastIndexOf('/') ) + fname;

		if ( c.indexOf('alignleft') != -1 ) {
			t.I('alignleft').checked = "checked";
			d.className = "alignleft";
		} else if ( c.indexOf('aligncenter') != -1 ) {
			t.I('aligncenter').checked = "checked";
			d.className = "aligncenter";
		} else if ( c.indexOf('alignright') != -1 ) {
			t.I('alignright').checked = "checked";
			d.className = "alignright";
		} else if ( c.indexOf('alignnone') != -1 ) {
			t.I('alignnone').checked = "checked";
			d.className = "alignnone";
		}

		t.getImageData();

		if ( (t.width * 1.3) > parseInt(t.preloadImg.width) ) {
			var s130 = t.I('s130'), s120 = t.I('s120'), s110 = t.I('s110');

			s130.onclick = s120.onclick = s110.onclick = null;
			s130.onmouseover = s120.onmouseover = s110.onmouseover = null;
			s130.style.color = s120.style.color = s110.style.color = '#aaa';
		}

		document.body.style.display = '';
/*
		// Test if is attachment
		if ( (id = c.match( /wp-image-([0-9]{1,6})/ )) && id[1] ) {
			t.I('tab_attachment').href = tinymce.documentBaseURL + 'media.php?action=edit&attachment_id=' + id[1];
			t.I('tab_attachment').style.display = 'inline';
		}
*/
	},

	remove : function() {
		var ed = tinyMCEPopup.editor, p, el;

		tinyMCEPopup.restoreSelection();
		el = ed.selection.getNode();
		if (el.nodeName != 'IMG') return;

		if ( (p = ed.dom.getParent(el, 'A')) && p.childNodes.length == 1)
			ed.dom.remove(p);
		else
			ed.dom.remove(el);

		ed.execCommand('mceRepaint');
		tinyMCEPopup.close();
		return;
	},

	update : function() {
		var t = this, f = document.forms[0], nl = f.elements, ed = tinyMCEPopup.editor, el, P, v = f.img_classes.value;

		tinyMCEPopup.restoreSelection();
		el = ed.selection.getNode();

		if (el.nodeName != 'IMG') return;
		if (f.img_src.value === '') t.remove();
		P = ed.dom.getParent(el, 'p');
		if ( P && P.style && P.style.textAlign == 'center' )
			ed.dom.setStyle(P, 'textAlign', '');
/*
		if ( tinymce.isIE ) {
			if ( f.img_classes.value.indexOf('aligncenter') != -1 )
				ed.dom.addClass(P, 'mce_iecenter');
			else ed.dom.removeClass(P, 'mce_iecenter');
		}
*/
		if ( v.indexOf('alignleft') != -1 )
			tinyMCEPopup.execCommand('JustifyLeft');
		else if ( v.indexOf('alignright') != -1 )
			tinyMCEPopup.execCommand('JustifyRight');
		else if ( v.indexOf('aligncenter') != -1 )
			tinyMCEPopup.execCommand('JustifyCenter');

		ed.dom.setAttribs(el, {
			src : f.img_src.value,
			title : f.img_title.value,
			alt : f.img_alt.value,
			width : f.width.value,
			height : f.height.value,
			style : f.img_style.value,
			'class' : f.img_classes.value
		});

		pa = ed.dom.getParent(el, 'A');

		if ( ! f.link_href.value ) {
			if ( pa ) {
				tinyMCEPopup.execCommand("mceBeginUndoLevel");
				b = ed.selection.getBookmark();
				ed.dom.remove(pa, 1);
				ed.selection.moveToBookmark(b);
				tinyMCEPopup.execCommand("mceEndUndoLevel");
				tinyMCEPopup.close();
				return;
			}
		}

		tinyMCEPopup.execCommand("mceBeginUndoLevel");

		// Create new anchor elements
		if (pa == null) {
			tinyMCEPopup.execCommand("CreateLink", false, "#mce_temp_url#", {skip_undo : 1});

			tinymce.each(ed.dom.select("a"), function(n) {
				if (ed.dom.getAttrib(n, 'href') == '#mce_temp_url#') {

					ed.dom.setAttribs(n, {
						href : f.link_href.value,
						title : f.link_title.value,
						rel : f.link_rel.value,
						target : (f.link_target.checked == true) ? '_blank' : '',
						'class' : f.link_classes.value,
						style : f.link_style.value
					});
				}
			});
		} else {
			ed.dom.setAttribs(pa, {
				href : f.link_href.value,
				title : f.link_title.value,
				rel : f.link_rel.value,
				target : (f.link_target.checked == true) ? '_blank' : '',
				'class' : f.link_classes.value,
				style : f.link_style.value
			});
		}

		tinyMCEPopup.execCommand("mceEndUndoLevel");
		tinyMCEPopup.close();
	},

	updateStyle : function(ty) {
		var dom = tinyMCEPopup.dom, st, v, f = document.forms[0], img = dom.create('img', {style : f.img_style.value});

		if (tinyMCEPopup.editor.settings.inline_styles) {
			// Handle align
			if (ty == 'align') {
				dom.setStyle(img, 'float', '');
				dom.setStyle(img, 'vertical-align', '');

				v = f.align.value;
				if (v) {
					if (v == 'left' || v == 'right')
						dom.setStyle(img, 'float', v);
					else
						img.style.verticalAlign = v;
				}
			}

			// Handle border
			if (ty == 'border') {
				dom.setStyle(img, 'border', '');

				v = f.border.value;
				if (v || v == '0') {
					if (v == '0')
						img.style.border = '0';
					else
						img.style.border = v + 'px solid black';
				}
			}

			// Handle hspace
			if (ty == 'hspace') {
				dom.setStyle(img, 'marginLeft', '');
				dom.setStyle(img, 'marginRight', '');

				v = f.hspace.value;
				if (v) {
					img.style.marginLeft = v + 'px';
					img.style.marginRight = v + 'px';
				}
			}

			// Handle vspace
			if (ty == 'vspace') {
				dom.setStyle(img, 'marginTop', '');
				dom.setStyle(img, 'marginBottom', '');

				v = f.vspace.value;
				if (v) {
					img.style.marginTop = v + 'px';
					img.style.marginBottom = v + 'px';
				}
			}

			// Merge
			f.img_style.value = dom.serializeStyle(dom.parseStyle(img.style.cssText));
			this.demoSetStyle();
		}
	},

	checkVal : function(f) {

		if ( f.value == '' ) {
	//		if ( f.id == 'width' ) f.value = this.width || this.preloadImg.width;
	//		if ( f.id == 'height' ) f.value = this.height || this.preloadImg.height;
			if ( f.id == 'img_src' ) f.value = this.I('img_demo').src || this.preloadImg.src;
		}
	},

	resetImageData : function() {
		var f = document.forms[0];

		f.width.value = f.height.value = '';
	},

	updateImageData : function() {
		var f = document.forms[0], t = wpImage;

		if ( f.width.value == '' || f.height.value == '' ) {
			f.width.value = t.preloadImg.width;
			f.height.value = t.preloadImg.height;
		}
		t.demoSetSize();
	},

	getImageData : function() {
		var t = wpImage, f = document.forms[0];

		t.preloadImg = new Image();
		t.preloadImg.onload = t.updateImageData;
		t.preloadImg.onerror = t.resetImageData;
		t.preloadImg.src = tinyMCEPopup.editor.documentBaseURI.toAbsolute(f.img_src.value);
	}
};

window.onload = function(){wpImage.init();}
wpImage.preInit();
