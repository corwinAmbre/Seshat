var EpubBuilder = function(project) {
	this.project = project;
	if(project.exportConfig === undefined || project.exportConfig === null) {
		this.config = {
			content: {
				tableOfContent: 'Table of contents',
				sceneSeparator: '<br/><br/><div style="width: 100%; text-align:center">***</div><br/><br/>',
				chapterWithTitleFormat: '#d.<br/>#t',
				chapterWithoutTitleFormat: '#d.',
				chapterWithTitleFormatNav: '#t',
				chapterWithoutTitleFormatNav: 'Chapter #d',
				exportAllChapters: true,
				exportFromChapter: 1,
				exportToChapter: null
			},
			exportFormat: 'epub', // Authorized values: 'epub', 'pdf', 'txt'
			navPosition: 'end' // Authorized values: 'start', 'end' and 'none'
		};
	} else {
		this.config = project.exportConfig;
	}
}

EpubBuilder.prototype.getChapterTitle = function (chapter, forNav) {
	forNav = forNav || false;
	if(chapter.title.length > 0) {
		var result = forNav ? this.config.content.chapterWithTitleFormatNav : this.config.content.chapterWithTitleFormat;
		result = result.replace("#d", chapter.number);
		result = result.replace("#t", chapter.title);
		return result;
	} else {
		var result = forNav ? this.config.content.chapterWithoutTitleFormatNav : this.config.content.chapterWithoutTitleFormat;
		result = result.replace("#d", chapter.number);
		return  result;
	}
}

EpubBuilder.prototype.build = function(callback) {
	switch(this.config.exportFormat) {
	case 'pdf':
		this.buildPdf(callback);
		break;
	case 'txt':
		//this.buildTxt(callback);
		break;
	case 'epub':
	default:
		this.buildEpub(callback);
	}
	
}

EpubBuilder.prototype.buildTxt = function(callback) {
}

EpubBuilder.prototype.buildPdf = function(callback) {
	var $this = this;
	
	var pdfDoc = new PDFDocument();
	var stream = pdfDoc.pipe(blobStream());
	
	pdfDoc.info.Title = this.project.name;
	
	pdfDoc.fontSize(25)
		.text(this.project.name, {
			align: 'center'
		});
	
	this.project.chapters.forEach(function(chapter) {
		if($this.config.content.exportAllChapters == true || ($this.config.content.exportFromChapter <= chapter.number && $this.config.content.exportToChapter >= chapter.number)) {
			pdfDoc.addPage();
			pdfDoc.font('Helvetica-Oblique', 18)
				.text($this.getChapterTitle(chapter, true), {
					align: 'center',
					features: ["ital"]
				})
				.font('Times-Roman', 12);
			pdfDoc.moveDown();
			var first = true;
			chapter.content.forEach(function(scene) {
				if(first) {
					first = false;
				} else {
					$this.convertHtmlToPdf(pdfDoc, $this.config.content.sceneSeparator, {
						align: 'center'
					});
				}
				$this.convertHtmlToPdf(pdfDoc, scene.content);
			});
		}
	});	
	pdfDoc.end();
	stream.on('finish', function() {
		blob = stream.toBlob('application/pdf');
		callback(blob);
	});	
}

EpubBuilder.prototype.convertHtmlToPdf = function(doc, content, options) {
	if(content == null) {
		return;
	}
	options = options || {};
	content = content.split('<br/>').join('\n');
	content = content.split('<br>').join('\n');
	content = content.split('&nbsp;').join(' ');
	content = content.split('<div>').join('\n');
	content = content.split('</div>').join('');
	content = content.replace(new RegExp("<div(.*)>", "g"), "\n");
	var italicPos = content.indexOf("<i>");
	if(italicPos >= 0) {
		var endOfItalic = content.indexOf("</i>");
		if(italicPos > 0) {
			options.continued = true;
			this.convertHtmlToPdf(doc, content.slice(0, italicPos), options);
		}
		doc.font('Times-Italic', 12);
		this.convertHtmlToPdf(doc, content.slice(italicPos + 3, endOfItalic), options);
		doc.font('Times-Roman', 12);
		options.continued = false;
		this.convertHtmlToPdf(doc, content.slice(endOfItalic + 4), options);
		return;
	}
	var boldPos = content.indexOf("<b>");
	if(boldPos >= 0) {
		var endOfBold = content.indexOf("</b>");
		if(boldPos > 0) {
			options.continued = true;
			this.convertHtmlToPdf(doc, content.slice(0, boldPos), options);
		}
		doc.font('Times-Bold', 12);
		this.convertHtmlToPdf(doc, content.slice(boldPos + 3, endOfBold), options);
		doc.font('Times-Roman', 12);
		options.continued = false;
		this.convertHtmlToPdf(doc, content.slice(endOfBold + 4), options);
		return;
	}
	doc.text(content, options);
}


EpubBuilder.prototype.buildEpub = function(callback) {
	// Prepare data
	var uniqueIdentifier = "myUniqueId";
	var $this = this;
	
	// Create blobs
	// Mimetype (mimetype)
	var mimetypeBlob = new Blob(['application/epub+zip'], {type: "plain/text"});
	// Container (META-INF/container.xml)
	var containerContent = '<?xml version="1.0"?>' +
		'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
			'<rootfiles>' +
				'<rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml" />' +
			'</rootfiles>' +
		'</container>';
	var containerBlob = new Blob([containerContent], {type: "application/xml"});
	// Chapters documents (OEBPS/chapterX.xhtml)
	var chaptersManifest = '';
	var spineManifest = '';
	var chapterBlobs = new Array();
	var navContent = '<?xml version="1.0" encoding="UTF-8"?>' + 
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">' +
			'<head>' +
				'<title>' + this.project.name + '</title>' +
				'<meta charset="utf-8"/>' +
			'</head>' +
			'<body>' +
				'<section epub:type="frontmatter toc">' +
					'<header style="width:100%; text-align:center">' +
						'<h1>' + this.config.content.tableOfContent + '</h1>' + 
					'</header>' +
					'<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc">' +
						'<ol>';
	this.project.chapters.forEach(function(chapter) {
		if($this.config.content.exportAllChapters == true || ($this.config.content.exportFromChapter <= chapter.number && $this.config.content.exportToChapter >= chapter.number)) {
			chaptersManifest += '<item id="chapter' + chapter.number + '" href="chapter' + chapter.number + '.xhtml" media-type="application/xhtml+xml"/>';
			spineManifest    += '<itemref idref="chapter' + chapter.number + '"/>';
			navContent       += '<li><a href="chapter' + chapter.number + '.xhtml">' + $this.getChapterTitle(chapter, true) + '</a></li>';
			var chapterContent = '<?xml version="1.0" encoding="UTF-8"?>' +
				'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">' +
				'<head>' +
					'<title>' +	$this.project.name + '</title>' +
					'<meta charset="utf-8"/>' +
				'</head>' +
				'<body>' +
					'<section epub:type="bodymatter chapter">' +
						'<header style="width:100%; text-align:center">' +
							'<h1>' + $this.getChapterTitle(chapter) + '</h1>' +
						'</header>';
			var first = true;
			chapter.content.forEach(function(scene) {
				if(first) {
					first = false;
				} else {
					chapterContent += $this.config.content.sceneSeparator;
				}
				chapterContent += scene.content;
			});
			chapterContent += '</section></body></html>';
			chapterBlobs["chapter" + chapter.number] = new Blob([chapterContent], {type: 'application/xhtml+xml'});
		}
	});
	// Nav document (OEBPS/nav.xhtml)
	navContent += '</ol></nav></section></body></html>';
	var navDoc = new Blob([navContent], {type: 'application/xhtml+xml'});
	
	  
	// Package document (OEBPS/package.opf)
	var lastModifiedDate = new Date().toISOString();
	lastModifiedDate = lastModifiedDate.slice(0, lastModifiedDate.lastIndexOf(".")) + "Z";
	var packageDocContent = '<?xml version="1.0" encoding="UTF-8"?>' + 
			'<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="epub-id">' +
				'<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">' +
					'<dc:identifier id="epub-id">urn:uuid:' + uniqueIdentifier + '</dc:identifier>' +
					'<dc:title>' + this.project.name + '</dc:title>' +
					'<dc:language>en</dc:language>' +
					'<meta property="dcterms:modified">' + lastModifiedDate + '</meta>' +
				'</metadata>' +
				'<manifest>' +
					'<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>' +
					chaptersManifest +
				'</manifest>' +
				'<spine>' +
					(this.config.navPosition == 'start' ? '<itemref idref="nav" linear="no"/>' : '') +
					spineManifest +
					(this.config.navPosition == 'end' ? '<itemref idref="nav" linear="no"/>' : '') +
				'</spine>' +
				'</package>';
	var packageDoc = new Blob([packageDocContent], {type: 'application/oebps-package+xml'});
	
	// Bundle them into zip file using filesystem
	var zipFs = new zip.fs.FS();
	zipFs.root.addBlob("mimetype", mimetypeBlob);
	var metaInfDir = zipFs.root.addDirectory("META-INF");
	var oebpsDir   = zipFs.root.addDirectory("OEBPS");
	metaInfDir.addBlob("container.xml", containerBlob);
	oebpsDir.addBlob("nav.xhtml", navDoc);
	oebpsDir.addBlob("package.opf", packageDoc);
	Object.keys(chapterBlobs).forEach(function(key) {
		oebpsDir.addBlob(key + ".xhtml", chapterBlobs[key]);
	});
	zipFs.exportBlob(callback);
}