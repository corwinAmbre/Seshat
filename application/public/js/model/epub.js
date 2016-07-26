var EpubBuilder = function(project) {
	this.project = project;
	this.config = {
	};
}

EpubBuilder.prototype.build = function(callback) {
	// Prepare data
	var uniqueIdentifier = "myUniqueId";
	
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
					'<header>' +
						'<h1>Contents</h1>' + 
					'</header>' +
					'<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc">' +
						'<ol>';
	this.project.chapters.forEach(function(chapter) {
		chaptersManifest += '<item id="chapter' + chapter.number + '" href="chapter' + chapter.number + '.xhtml" media-type="application/xhtml+xml"/>';
		spineManifest    += '<itemref idref="chapter' + chapter.number + '"/>';
		navContent       += '<li><a href="chapter' + chapter.number + '.xhtml">Chapter ' + chapter.number + '</a></li>';
		var chapterContent = '<?xml version="1.0" encoding="UTF-8"?>' +
			'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">' +
			'<head>' +
				'<title>' +	this.project.name + '</title>' +
				'<meta charset="utf-8"/>' +
			'</head>' +
			'<body>' +
				'<section epub:type="bodymatter chapter">' +
					'<header>' +
						'<h1> Chapter ' + chapter.number + '.' + (chapter.title.length > 0 ? (" " + chapter.title) : "") + '</h1>' +
					'</header>';
		var first = true;
		chapter.content.forEach(function(scene) {
			if(first) {
				first = false;
			} else {
				chapterContent += '<br/><br/><div style="margin:auto">***</div><br/><br/>';
			}
			chapterContent += scene.content;
		});
		chapterContent += '</section></body></html>';
		chapterBlobs["chapter" + chapter.number] = new Blob([chapterContent], {type: 'application/xhtml+xml'});
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
					spineManifest +
					'<itemref idref="nav" linear="no"/>' +
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