/*! nlp_compromise 
 by @spencermountain
 2015-03-02 */
//
// nlp_compromise - @spencermountain - gplv3
// https://github.com/spencermountain/nlp_compromise
//
//
var nlp = (function() {
  "use strict";

  ///
  // header
  //
var multiples = [
    "of course",
    "at least",
    "no longer",
    "sort of",
    "at first",
    "once again",
    "up to",
    "once more",
    "by now",
    "all but",
    "just about",
    "as yet",
    "on board",
    "a lot",
    "by far",
    "at best",
    "at large",
    "for good",
    "vice versa",
    "en route",
    "for sure",
    "upside down",
    "at most",
    "per se",
    "up front",
    "in situ",
    "in vitro",
    "at worst",
    "prima facie",
    "upwards of",
    "en masse",
    "a priori",
    "ad hoc",
    "et cetera",
    "de facto",
    "off guard",
    "spot on",
    "ipso facto",
    "ad infinitum",
    "point blank",
    "ad nauseam",
    "inside out",
    "not withstanding",
    "for keeps",
    "de jure",
    "a la",
    "sub judice",
    "post hoc",
    "ad hominem",
    "a posteriori",
    "fed up",
    "brand new",
    "old fashioned",
    "bona fide",
    "well off",
    "far off",
    "par excellence",
    "straight forward",
    "hard up",
    "sui generis",
    "en suite",
    "avant garde",
    "sans serif",
    "gung ho",
    "super duper",
    "de trop",
    "new york",
    "new england",
    "new hampshire",
    "new delhi",
    "new jersey",
    "new mexico",
    "united states",
    "united kingdom",
    "great britain",
    "zero sum",

].map(function(m) {
    return m.split(' ')
})


if (typeof module !== "undefined" && module.exports) {
    exports.multiples = multiples;
}
var sentence_parser = function(text) {
  var abbrev, abbrevs, clean, i, sentences, tmp;
  tmp = text.split(/(\S.+?[.\?!])(?=\s+|$|")/g);
  sentences = [];
  abbrevs = ["jr", "mr", "mrs", "ms", "dr", "prof", "sr", "sen", "corp", "calif", "rep", "gov", "atty", "supt", "det", "rev", "col", "gen", "lt", "cmdr", "adm", "capt", "sgt", "cpl", "maj", "dept", "univ", "assn", "bros", "inc", "ltd", "co", "corp", "arc", "al", "ave", "blvd", "cl", "ct", "cres", "exp", "rd", "st", "dist", "mt", "ft", "fy", "hwy", "la", "pd", "pl", "plz", "tce", "Ala", "Ariz", "Ark", "Cal", "Calif", "Col", "Colo", "Conn", "Del", "Fed", "Fla", "Ga", "Ida", "Id", "Ill", "Ind", "Ia", "Kan", "Kans", "Ken", "Ky", "La", "Me", "Md", "Mass", "Mich", "Minn", "Miss", "Mo", "Mont", "Neb", "Nebr", "Nev", "Mex", "Okla", "Ok", "Ore", "Penna", "Penn", "Pa", "Dak", "Tenn", "Tex", "Ut", "Vt", "Va", "Wash", "Wis", "Wisc", "Wy", "Wyo", "USAFA", "Alta", "Ont", "QuÔøΩ", "Sask", "Yuk", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "sept", "vs", "etc", "esp", "llb", "md", "bl", "phd", "ma", "ba", "miss", "misses", "mister", "sir", "esq", "mstr", "lit", "fl", "ex", "eg", "sep", "sept"];
  abbrev = new RegExp("(^| )(" + abbrevs.join("|") + ")[.] ?$", "i");
  for (i in tmp) {
    if (tmp[i]) {
      tmp[i] = tmp[i].replace(/^\s+|\s+$/g, "");
      if (tmp[i].match(abbrev) || tmp[i].match(/[ |\.][A-Z]\.?$/)) {
        tmp[parseInt(i) + 1] = tmp[i] + " " + tmp[parseInt(i) + 1];
      } else {
        sentences.push(tmp[i]);
        tmp[i] = "";
      }
    }
  }
  // console.log(tmp)
  clean = [];
  for (i in sentences) {
    sentences[i] = sentences[i].replace(/^\s+|\s+$/g, "");
    if (sentences[i]) {
      clean.push(sentences[i]);
    }
  }
  if (clean.length == 0) {
    return [text]
  }
  return clean;
}
if (typeof module !== "undefined" && module.exports) {
  exports.sentences = sentence_parser;
}
// console.log(sentence_parser('Tony is nice. He lives in Japan.').length == 2)
// console.log(sentence_parser('I like that Color').length == 1)
// console.log(sentence_parser("Soviet bonds to be sold in the U.S. market. Everyone wins.").length == 2)
// console.log(sentence_parser("Hi there Dr. Joe, the price is 4.59 for N.A.S.A. Ph.Ds. I hope that's fine, etc. and you can attend Feb. 8th. Bye").length == 3)
// console.log(exports.sentences('How are you! That is great.').length==2)
var ngram = (function() {

  var main = function(text, options) {
    options = options || {}
    var min_count = options.min_count || 1; // minimum hit-count
    var max_size = options.max_size || 5; // maximum gram count
    var REallowedChars = /[^a-zA-Z'\-]+/g; //Invalid characters are replaced with a whitespace
    var i, j, k, textlen, len, s;
    var keys = [null];
    var results = [];
    max_size++;
    for (i = 1; i <= max_size; i++) {
      keys.push({});
    }
    // clean the text
    text = text.replace(REallowedChars, " ").replace(/^\s+/, "").replace(/\s+$/, "");
    text = text.toLowerCase()
    // Create a hash
    text = text.split(/\s+/);
    for (i = 0, textlen = text.length; i < textlen; i++) {
      s = text[i];
      keys[1][s] = (keys[1][s] || 0) + 1;
      for (j = 2; j <= max_size; j++) {
        if (i + j <= textlen) {
          s += " " + text[i + j - 1];
          keys[j][s] = (keys[j][s] || 0) + 1;
        } else break;
      }
    }
    // map to array
    for (var k = 1; k <= max_size; k++) {
      results[k] = [];
      var key = keys[k];
      for (var i in key) {
        if (key[i] >= min_count) results[k].push({
          "word": i,
          "count": key[i],
          "size": k
        });
      }
    }
    results = results.filter(function(s) {
      return s != null
    })
    results = results.map(function(r) {
      r = r.sort(function(a, b) {
        return b.count - a.count
      })
      return r;
    });
    return results
  }

  if (typeof module !== "undefined" && module.exports) {
    exports.ngram = main;
  }
  return main
})()

// s = ngram("i really think that we all really think it's all good")
// console.log(s)
var tokenize = (function() {


	if (typeof module !== "undefined" && module.exports) {
		sentence_parser = require("./sentence").sentences
		multiples = require("./data/multiples").multiples
	}

	var normalise = function(str) {
		if(!str){
			return ""
		}
		str = str.toLowerCase()
		str = str.replace(/[,\.!:;\?\(\)]/, '')
		str = str.replace(/’/g, "'")
		str = str.replace(/"/g, "")
		if(!str.match(/[a-z0-9]/i)){
			return ''
		}
		return str
	}

	var sentence_type = function(sentence) {
		if (sentence.match(/\?$/)) {
			return "question"
		} else {
			return "statement"
		}
	}

	var combine_multiples = function(arr) {
		var better = []
		for (var i = 0; i < arr.length; i++) {
			for (var o = 0; o < multiples.length; o++) {
				if (arr[i + 1] && normalise(arr[i]) == multiples[o][0] && normalise(arr[i + 1]) == multiples[o][1]) { //
					//we have a match
					arr[i] = arr[i] + ' ' + arr[i + 1]
					arr[i + 1] = null
					break
				}
			}
			better.push(arr[i])
		}
		return better.filter(function(w) {
			return w
		})
	}

	var main = function(str) {
		var sentences = sentence_parser(str)
		return sentences.map(function(sentence) {
			var arr = sentence.split(' ');
			arr = combine_multiples(arr)
			var tokens = arr.map(function(w, i) {
				return {
					text: w,
					normalised: normalise(w),
					capitalised: (w.match(/^[A-Z][a-z|A-Z]/) != null),
					special_capitalised: (w.match(/^[A-Z][a-z|A-Z]/) != null) && i>0,
					punctuated: (w.match(/[,;:\(\)"]/) != null) || undefined,
					end: (i == (arr.length - 1)) || undefined,
					start: (i == 0) || undefined
				}
			})
			return {
				sentence: sentence,
				tokens: tokens,
				type: sentence_type(sentence)
			}
		})
	}

	if (typeof module !== "undefined" && module.exports) {
		exports.tokenize = main;
	}
	return main
})()

// a = tokenize("Geroge Clooney walked, quietly into a bank of course. It was cold.")
// a = tokenize("If the debts are repaid, it could clear the way for Soviet bonds to be sold in the U.S.")
// a = tokenize("i live in new york")
// a = tokenize("How do you wear your swords? He’s like his character [Kuranosuke] Oishi.")
// a = tokenize("I speak optimistically of course.")
// a = tokenize("in the United States of America")
// a = tokenize("Joe is 9")
// a = tokenize("he is in the band AFI")
// console.log(JSON.stringify(a, null, 2));



// var contractions = function(text) {
// 	//undo contractions
// 	if (text.match(/\b(he's|she's|it's)\b/)) {
// 		text = text.replace(/([^ ])['’]s /ig, '$1 is ');
// 	}
// 	text = text.replace(/([^ ])['’]ve /ig, '$1 have ');
// 	text = text.replace(/([^ ])['’]re /ig, '$1 are ');
// 	text = text.replace(/([^ ])['’]d /ig, '$1 would ');
// 	text = text.replace(/([^ ])['’]ll /ig, '$1 will ');
// 	text = text.replace(/([^ ])n['’]t /ig, '$1 not ');
// 	text = text.replace(/\bi'm /ig, 'I am ');
// 	return text
// }

// console.log(contractions("i think he's better"))
// a hugely-ignorant, and widely subjective transliteration of latin, cryllic, greek unicode characters to english ascii.
//https://docs.google.com/spreadsheet/ccc?key=0Ah46z755j7cVdFRDM1A2YVpwa1ZYWlpJM2pQZ003M0E

//http://en.wikipedia.org/wiki/List_of_Unicode_characters
// x=[]
// $("#collapsibleTable10 td:nth-child(2)").each(function(){return x.push($(this).text().trim())})
// JSON.stringify(x)



var normalize = (function() {


	var data = [
		["²", "2"],
		["ƻ", "2"],
		["³", "3"],
		["Ʒ", "3"],
		["Ƹ", "3"],
		["ƹ", "3"],
		["ƺ", "3"],
		["Ǯ", "3"],
		["ǯ", "3"],
		["З", "3"],
		["Ҙ", "3"],
		["ҙ", "3"],
		["Ӟ", "3"],
		["ӟ", "3"],
		["Ӡ", "3"],
		["ӡ", "3"],
		["Ȝ", "3"],
		["ȝ", "3"],
		["Ƽ", "5"],
		["ƽ", "5"],
		["Ȣ", "8"],
		["ȣ", "8"],
		["¡", "!"],
		["¿", "?"],
		["Ɂ", "?"],
		["ɂ", "?"],
		["ª", "a"],
		["À", "a"],
		["Á", "a"],
		["Â", "a"],
		["Ã", "a"],
		["Ä", "a"],
		["Å", "a"],
		["à", "a"],
		["á", "a"],
		["â", "a"],
		["ã", "a"],
		["ä", "a"],
		["å", "a"],
		["Ā", "a"],
		["ā", "a"],
		["Ă", "a"],
		["ă", "a"],
		["Ą", "a"],
		["ą", "a"],
		["Ǎ", "a"],
		["ǎ", "a"],
		["Ǟ", "a"],
		["ǟ", "a"],
		["Ǡ", "a"],
		["ǡ", "a"],
		["Ǻ", "a"],
		["ǻ", "a"],
		["Ȁ", "a"],
		["ȁ", "a"],
		["Ȃ", "a"],
		["ȃ", "a"],
		["Ȧ", "a"],
		["ȧ", "a"],
		["Ⱥ", "a"],
		["Ά", "a"],
		["Α", "a"],
		["Δ", "a"],
		["Λ", "a"],
		["ά", "a"],
		["α", "a"],
		["λ", "a"],
		["А", "a"],
		["Д", "a"],
		["а", "a"],
		["д", "a"],
		["Ѧ", "a"],
		["ѧ", "a"],
		["Ӑ", "a"],
		["ӑ", "a"],
		["Ӓ", "a"],
		["ӓ", "a"],
		["ƛ", "a"],
		["Ʌ", "a"],
		["ß", "b"],
		["þ", "b"],
		["ƀ", "b"],
		["Ɓ", "b"],
		["Ƃ", "b"],
		["ƃ", "b"],
		["Ƅ", "b"],
		["ƅ", "b"],
		["Ƀ", "b"],
		["Β", "b"],
		["β", "b"],
		["ϐ", "b"],
		["Ϧ", "b"],
		["Б", "b"],
		["В", "b"],
		["Ъ", "b"],
		["Ь", "b"],
		["б", "b"],
		["в", "b"],
		["ъ", "b"],
		["ь", "b"],
		["Ѣ", "b"],
		["ѣ", "b"],
		["Ҍ", "b"],
		["ҍ", "b"],
		["Ҕ", "b"],
		["ҕ", "b"],
		["ƥ", "b"],
		["ƾ", "b"],
		["¢", "c"],
		["©", "c"],
		["Ç", "c"],
		["ç", "c"],
		["Ć", "c"],
		["ć", "c"],
		["Ĉ", "c"],
		["ĉ", "c"],
		["Ċ", "c"],
		["ċ", "c"],
		["Č", "c"],
		["č", "c"],
		["Ɔ", "c"],
		["Ƈ", "c"],
		["ƈ", "c"],
		["Ȼ", "c"],
		["ȼ", "c"],
		["ͻ", "c"],
		["ͼ", "c"],
		["ͽ", "c"],
		["ϲ", "c"],
		["Ϲ", "c"],
		["Ͻ", "c"],
		["Ͼ", "c"],
		["Ͽ", "c"],
		["Є", "c"],
		["С", "c"],
		["с", "c"],
		["є", "c"],
		["Ҁ", "c"],
		["ҁ", "c"],
		["Ҫ", "c"],
		["ҫ", "c"],
		["Ð", "d"],
		["Ď", "d"],
		["ď", "d"],
		["Đ", "d"],
		["đ", "d"],
		["Ɖ", "d"],
		["Ɗ", "d"],
		["ȡ", "d"],
		["Ƌ", "d"],
		["ƌ", "d"],
		["Ƿ", "d"],
		["È", "e"],
		["É", "e"],
		["Ê", "e"],
		["Ë", "e"],
		["è", "e"],
		["é", "e"],
		["ê", "e"],
		["ë", "e"],
		["Ē", "e"],
		["ē", "e"],
		["Ĕ", "e"],
		["ĕ", "e"],
		["Ė", "e"],
		["ė", "e"],
		["Ę", "e"],
		["ę", "e"],
		["Ě", "e"],
		["ě", "e"],
		["Ǝ", "e"],
		["Ə", "e"],
		["Ɛ", "e"],
		["ǝ", "e"],
		["Ȅ", "e"],
		["ȅ", "e"],
		["Ȇ", "e"],
		["ȇ", "e"],
		["Ȩ", "e"],
		["ȩ", "e"],
		["Ɇ", "e"],
		["ɇ", "e"],
		["Έ", "e"],
		["Ε", "e"],
		["Ξ", "e"],
		["Σ", "e"],
		["έ", "e"],
		["ε", "e"],
		["ξ", "e"],
		["ϱ", "e"],
		["ϵ", "e"],
		["϶", "e"],
		["Ѐ", "e"],
		["Ё", "e"],
		["Е", "e"],
		["Э", "e"],
		["е", "e"],
		["ѐ", "e"],
		["ё", "e"],
		["Ҽ", "e"],
		["ҽ", "e"],
		["Ҿ", "e"],
		["ҿ", "e"],
		["Ӗ", "e"],
		["ӗ", "e"],
		["Ә", "e"],
		["ә", "e"],
		["Ӛ", "e"],
		["ӛ", "e"],
		["Ӭ", "e"],
		["ӭ", "e"],
		["Ƒ", "f"],
		["ƒ", "f"],
		["Ϝ", "f"],
		["ϝ", "f"],
		["Ӻ", "f"],
		["ӻ", "f"],
		["Ĝ", "g"],
		["ĝ", "g"],
		["Ğ", "g"],
		["ğ", "g"],
		["Ġ", "g"],
		["ġ", "g"],
		["Ģ", "g"],
		["ģ", "g"],
		["Ɠ", "g"],
		["Ǥ", "g"],
		["ǥ", "g"],
		["Ǧ", "g"],
		["ǧ", "g"],
		["Ǵ", "g"],
		["ǵ", "g"],
		["Ĥ", "h"],
		["ĥ", "h"],
		["Ħ", "h"],
		["ħ", "h"],
		["ƕ", "h"],
		["Ƕ", "h"],
		["Ȟ", "h"],
		["ȟ", "h"],
		["Ή", "h"],
		["Η", "h"],
		["Ђ", "h"],
		["Њ", "h"],
		["Ћ", "h"],
		["Н", "h"],
		["н", "h"],
		["ђ", "h"],
		["ћ", "h"],
		["Ң", "h"],
		["ң", "h"],
		["Ҥ", "h"],
		["ҥ", "h"],
		["Һ", "h"],
		["һ", "h"],
		["Ӊ", "h"],
		["ӊ", "h"],
		["Ì", "I"],
		["Í", "I"],
		["Î", "I"],
		["Ï", "I"],
		["ì", "i"],
		["í", "i"],
		["î", "i"],
		["ï", "i"],
		["Ĩ", "i"],
		["ĩ", "i"],
		["Ī", "i"],
		["ī", "i"],
		["Ĭ", "i"],
		["ĭ", "i"],
		["Į", "i"],
		["į", "i"],
		["İ", "i"],
		["ı", "i"],
		["Ɩ", "i"],
		["Ɨ", "i"],
		["Ȉ", "i"],
		["ȉ", "i"],
		["Ȋ", "i"],
		["ȋ", "i"],
		["Ί", "i"],
		["ΐ", "i"],
		["Ϊ", "i"],
		["ί", "i"],
		["ι", "i"],
		["ϊ", "i"],
		["І", "i"],
		["Ї", "i"],
		["і", "i"],
		["ї", "i"],
		["Ĵ", "j"],
		["ĵ", "j"],
		["ǰ", "j"],
		["ȷ", "j"],
		["Ɉ", "j"],
		["ɉ", "j"],
		["ϳ", "j"],
		["Ј", "j"],
		["ј", "j"],
		["Ķ", "k"],
		["ķ", "k"],
		["ĸ", "k"],
		["Ƙ", "k"],
		["ƙ", "k"],
		["Ǩ", "k"],
		["ǩ", "k"],
		["Κ", "k"],
		["κ", "k"],
		["Ќ", "k"],
		["Ж", "k"],
		["К", "k"],
		["ж", "k"],
		["к", "k"],
		["ќ", "k"],
		["Қ", "k"],
		["қ", "k"],
		["Ҝ", "k"],
		["ҝ", "k"],
		["Ҟ", "k"],
		["ҟ", "k"],
		["Ҡ", "k"],
		["ҡ", "k"],
		["Ĺ", "l"],
		["ĺ", "l"],
		["Ļ", "l"],
		["ļ", "l"],
		["Ľ", "l"],
		["ľ", "l"],
		["Ŀ", "l"],
		["ŀ", "l"],
		["Ł", "l"],
		["ł", "l"],
		["ƚ", "l"],
		["ƪ", "l"],
		["ǀ", "l"],
		["Ǐ", "l"],
		["ǐ", "l"],
		["ȴ", "l"],
		["Ƚ", "l"],
		["Ι", "l"],
		["Ӏ", "l"],
		["ӏ", "l"],
		["Μ", "m"],
		["Ϻ", "m"],
		["ϻ", "m"],
		["М", "m"],
		["м", "m"],
		["Ӎ", "m"],
		["ӎ", "m"],
		["Ñ", "n"],
		["ñ", "n"],
		["Ń", "n"],
		["ń", "n"],
		["Ņ", "n"],
		["ņ", "n"],
		["Ň", "n"],
		["ň", "n"],
		["ŉ", "n"],
		["Ŋ", "n"],
		["ŋ", "n"],
		["Ɲ", "n"],
		["ƞ", "n"],
		["Ǹ", "n"],
		["ǹ", "n"],
		["Ƞ", "n"],
		["ȵ", "n"],
		["Ν", "n"],
		["Π", "n"],
		["ή", "n"],
		["η", "n"],
		["Ϟ", "n"],
		["Ѝ", "n"],
		["И", "n"],
		["Й", "n"],
		["Л", "n"],
		["П", "n"],
		["и", "n"],
		["й", "n"],
		["л", "n"],
		["п", "n"],
		["ѝ", "n"],
		["Ҋ", "n"],
		["ҋ", "n"],
		["Ӆ", "n"],
		["ӆ", "n"],
		["Ӣ", "n"],
		["ӣ", "n"],
		["Ӥ", "n"],
		["ӥ", "n"],
		["π", "n"],
		["Ò", "o"],
		["Ó", "o"],
		["Ô", "o"],
		["Õ", "o"],
		["Ö", "o"],
		["Ø", "o"],
		["ð", "o"],
		["ò", "o"],
		["ó", "o"],
		["ô", "o"],
		["õ", "o"],
		["ö", "o"],
		["ø", "o"],
		["Ō", "o"],
		["ō", "o"],
		["Ŏ", "o"],
		["ŏ", "o"],
		["Ő", "o"],
		["ő", "o"],
		["Ɵ", "o"],
		["Ơ", "o"],
		["ơ", "o"],
		["Ǒ", "o"],
		["ǒ", "o"],
		["Ǫ", "o"],
		["ǫ", "o"],
		["Ǭ", "o"],
		["ǭ", "o"],
		["Ǿ", "o"],
		["ǿ", "o"],
		["Ȍ", "o"],
		["ȍ", "o"],
		["Ȏ", "o"],
		["ȏ", "o"],
		["Ȫ", "o"],
		["ȫ", "o"],
		["Ȭ", "o"],
		["ȭ", "o"],
		["Ȯ", "o"],
		["ȯ", "o"],
		["Ȱ", "o"],
		["ȱ", "o"],
		["Ό", "o"],
		["Θ", "o"],
		["Ο", "o"],
		["Φ", "o"],
		["Ω", "o"],
		["δ", "o"],
		["θ", "o"],
		["ο", "o"],
		["σ", "o"],
		["ό", "o"],
		["ϕ", "o"],
		["Ϙ", "o"],
		["ϙ", "o"],
		["Ϭ", "o"],
		["ϭ", "o"],
		["ϴ", "o"],
		["О", "o"],
		["Ф", "o"],
		["о", "o"],
		["Ѳ", "o"],
		["ѳ", "o"],
		["Ѻ", "o"],
		["ѻ", "o"],
		["Ѽ", "o"],
		["ѽ", "o"],
		["Ӧ", "o"],
		["ӧ", "o"],
		["Ө", "o"],
		["ө", "o"],
		["Ӫ", "o"],
		["ӫ", "o"],
		["¤", "o"],
		["ƍ", "o"],
		["Ώ", "o"],
		["Ƥ", "p"],
		["ƿ", "p"],
		["Ρ", "p"],
		["ρ", "p"],
		["Ϸ", "p"],
		["ϸ", "p"],
		["ϼ", "p"],
		["Р", "p"],
		["р", "p"],
		["Ҏ", "p"],
		["ҏ", "p"],
		["Þ", "p"],
		["Ɋ", "q"],
		["ɋ", "q"],
		["­®", "r"],
		["Ŕ", "r"],
		["ŕ", "r"],
		["Ŗ", "r"],
		["ŗ", "r"],
		["Ř", "r"],
		["ř", "r"],
		["Ʀ", "r"],
		["Ȑ", "r"],
		["ȑ", "r"],
		["Ȓ", "r"],
		["ȓ", "r"],
		["Ɍ", "r"],
		["ɍ", "r"],
		["Ѓ", "r"],
		["Г", "r"],
		["Я", "r"],
		["г", "r"],
		["я", "r"],
		["ѓ", "r"],
		["Ґ", "r"],
		["ґ", "r"],
		["Ғ", "r"],
		["ғ", "r"],
		["Ӷ", "r"],
		["ӷ", "r"],
		["ſ", "r"],
		["Ś", "s"],
		["ś", "s"],
		["Ŝ", "s"],
		["ŝ", "s"],
		["Ş", "s"],
		["ş", "s"],
		["Š", "s"],
		["š", "s"],
		["Ƨ", "s"],
		["ƨ", "s"],
		["Ș", "s"],
		["ș", "s"],
		["ȿ", "s"],
		["ς", "s"],
		["Ϛ", "s"],
		["ϛ", "s"],
		["ϟ", "s"],
		["Ϩ", "s"],
		["ϩ", "s"],
		["Ѕ", "s"],
		["ѕ", "s"],
		["Ţ", "t"],
		["ţ", "t"],
		["Ť", "t"],
		["ť", "t"],
		["Ŧ", "t"],
		["ŧ", "t"],
		["ƫ", "t"],
		["Ƭ", "t"],
		["ƭ", "t"],
		["Ʈ", "t"],
		["Ț", "t"],
		["ț", "t"],
		["ȶ", "t"],
		["Ⱦ", "t"],
		["Γ", "t"],
		["Τ", "t"],
		["τ", "t"],
		["Ϯ", "t"],
		["ϯ", "t"],
		["Т", "t"],
		["т", "t"],
		["҂", "t"],
		["Ҭ", "t"],
		["ҭ", "t"],
		["µ", "u"],
		["Ù", "u"],
		["Ú", "u"],
		["Û", "u"],
		["Ü", "u"],
		["ù", "u"],
		["ú", "u"],
		["û", "u"],
		["ü", "u"],
		["Ũ", "u"],
		["ũ", "u"],
		["Ū", "u"],
		["ū", "u"],
		["Ŭ", "u"],
		["ŭ", "u"],
		["Ů", "u"],
		["ů", "u"],
		["Ű", "u"],
		["ű", "u"],
		["Ų", "u"],
		["ų", "u"],
		["Ư", "u"],
		["ư", "u"],
		["Ʊ", "u"],
		["Ʋ", "u"],
		["Ǔ", "u"],
		["ǔ", "u"],
		["Ǖ", "u"],
		["ǖ", "u"],
		["Ǘ", "u"],
		["ǘ", "u"],
		["Ǚ", "u"],
		["ǚ", "u"],
		["Ǜ", "u"],
		["ǜ", "u"],
		["Ȕ", "u"],
		["ȕ", "u"],
		["Ȗ", "u"],
		["ȗ", "u"],
		["Ʉ", "u"],
		["ΰ", "u"],
		["μ", "u"],
		["υ", "u"],
		["ϋ", "u"],
		["ύ", "u"],
		["ϑ", "u"],
		["Џ", "u"],
		["Ц", "u"],
		["Ч", "u"],
		["ц", "u"],
		["џ", "u"],
		["Ҵ", "u"],
		["ҵ", "u"],
		["Ҷ", "u"],
		["ҷ", "u"],
		["Ҹ", "u"],
		["ҹ", "u"],
		["Ӌ", "u"],
		["ӌ", "u"],
		["Ӈ", "u"],
		["ӈ", "u"],
		["Ɣ", "v"],
		["ν", "v"],
		["Ѵ", "v"],
		["ѵ", "v"],
		["Ѷ", "v"],
		["ѷ", "v"],
		["Ŵ", "w"],
		["ŵ", "w"],
		["Ɯ", "w"],
		["ω", "w"],
		["ώ", "w"],
		["ϖ", "w"],
		["Ϣ", "w"],
		["ϣ", "w"],
		["Ш", "w"],
		["Щ", "w"],
		["ш", "w"],
		["щ", "w"],
		["ѡ", "w"],
		["ѿ", "w"],
		["×", "x"],
		["Χ", "x"],
		["χ", "x"],
		["ϗ", "x"],
		["ϰ", "x"],
		["Х", "x"],
		["х", "x"],
		["Ҳ", "x"],
		["ҳ", "x"],
		["Ӽ", "x"],
		["ӽ", "x"],
		["Ӿ", "x"],
		["ӿ", "x"],
		["¥", "y"],
		["Ý", "y"],
		["ý", "y"],
		["ÿ", "y"],
		["Ŷ", "y"],
		["ŷ", "y"],
		["Ÿ", "y"],
		["Ƴ", "y"],
		["ƴ", "y"],
		["Ȳ", "y"],
		["ȳ", "y"],
		["Ɏ", "y"],
		["ɏ", "y"],
		["Ύ", "y"],
		["Υ", "y"],
		["Ψ", "y"],
		["Ϋ", "y"],
		["γ", "y"],
		["ψ", "y"],
		["ϒ", "y"],
		["ϓ", "y"],
		["ϔ", "y"],
		["Ў", "y"],
		["У", "y"],
		["у", "y"],
		["ч", "y"],
		["ў", "y"],
		["Ѱ", "y"],
		["ѱ", "y"],
		["Ү", "y"],
		["ү", "y"],
		["Ұ", "y"],
		["ұ", "y"],
		["Ӯ", "y"],
		["ӯ", "y"],
		["Ӱ", "y"],
		["ӱ", "y"],
		["Ӳ", "y"],
		["ӳ", "y"],
		["Ź", "z"],
		["ź", "z"],
		["Ż", "z"],
		["ż", "z"],
		["Ž", "z"],
		["ž", "z"],
		["Ʃ", "z"],
		["Ƶ", "z"],
		["ƶ", "z"],
		["Ȥ", "z"],
		["ȥ", "z"],
		["ɀ", "z"],
		["Ζ", "z"],
		["ζ", "z"],
	]

	//convert to two hashes
	var normaler = {}
	var greek = {}
	data.forEach(function(arr) {
		normaler[arr[0]] = arr[1]
		greek[arr[1]] = arr[0]
	})





	var normalize = function(str, options) {
		options = options || {}
		options.percentage = options.percentage || 50
		var arr = str.split('').map(function(s) {
			var r = Math.random() * 100
			if (normaler[s] && r < options.percentage) {
				return normaler[s] || s
			} else {
				return s
			}
		})
		return arr.join('')
	}

	var denormalize = function(str, options) {
		options = options || {}
		options.percentage = options.percentage || 50
		var arr = str.split('').map(function(s) {
			var r = Math.random() * 100
			if (greek[s] && r < options.percentage) {
				return greek[s] || s
			} else {
				return s
			}
		})
		return arr.join('')
	}



	var obj = {
		normalize: normalize,
		denormalize: denormalize,
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = obj;
	}
	return obj
})()


// s = "ӳžŽżźŹźӳžŽżźŹźӳžŽżźŹźӳžŽżźŹźӳžŽżźŹź"
// s = "Björk"
// console.log(normalize.normalize(s, {
// 	percentage: 50
// }))

// s = "handyman"
// s = "abcdefghijklmnopqrstuvwxyz"
// s = "The quick brown fox jumps over the lazy dog"
// console.log(normalize.denormalize(s, {
// 	percentage: 20
// }))
var syllables = (function(str) {


	var main = function(str) {
		var all = []

		//suffix fixes
			function postprocess(arr) {
				//trim whitespace
				arr= arr.map(function(w){
					w= w.replace(/^ */,'')
					w= w.replace(/ *$/,'')
					return w
				})
				if (!arr.length <= 2) { //?
					return arr
				}
				var twos = [
					/[^aeiou]ying$/,
					/yer$/,
				]
				var ones = [
					/^[^aeiou]?ion/,
					/^[^aeiou]?ised/,
					/^[^aeiou]?iled/,
				]
				var l = arr.length
				var suffix = arr[l - 2] + arr[l - 1];
				for (var i = 0; i < ones.length; i++) {
					if (suffix.match(ones[i])) {
						arr[l - 2] = arr[l - 2] + arr[l - 1]
						arr.pop()
					}
				}
				return arr
			}

		var doer = function(str) {
			var vow = /[aeiouy]$/
			if (!str) {
				return
			}
			var chars = str.split('')
			var before = "";
			var after = "";
			var current = "";
			for (var i = 0; i < chars.length; i++) {
				before = chars.slice(0, i).join('')
				current = chars[i]
				after = chars.slice(i + 1, chars.length).join('')
				var candidate = before + chars[i]
				// console.log(before + "(" + current + ")" + after)
				//
				//rules for syllables-

				//it's a consonant that comes after a vowel
				if (before.match(vow) && !current.match(vow)) {
					if (after.match(/^e[sm]/)) {
						candidate += "e"
						after = after.replace(/^e/, '')
					}
					all.push(candidate)
					return doer(after)
				}
				//unblended vowels ('noisy' vowel combinations)
				if (candidate.match(/(eo|eu|ia|oa|ua|ui)$/i)) { //'io' is noisy, not in 'ion'
					all.push(before)
					all.push(current)
					return doer(after)
				}
				//if it has 4 consonants in a row, it's starting to be a mouthful for one syllable- like 'birchtree'
				// if(candidate.match(/[^aeiou]{4}$/)){
				// 	all.push(candidate.replace(/[^aeiou]{2}$/,''))
				// 	l= candidate.length - 1
				// 	candidate=candidate.slice(l-2, l)
				// }
			}
			//if still running, end last syllable
			if (str.match(/[aiouy]/) || str.match(/ee$/)) { //allow silent trailing e
				all.push(str)
			} else {
				all[all.length - 1] = (all[all.length - 1] || '') + str; //append it to the last one
			}
		}

		str.split(/\s-/).forEach(function(s) {
			doer(s)
		})
		all = postprocess(all)

		//for words like 'tree' and 'free'
		if(all.length==0){
			all=[str]
		}

		return all
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main
})()

// console.log(syllables("suddenly").length == 3)
// console.log(syllables("constipation").length == 4)
// console.log(syllables("diabolic").length == 4)
// console.log(syllables("fate").length == 1)
// console.log(syllables("fated").length == 2)
// console.log(syllables("fates").length == 1)
// console.log(syllables("genetic").length == 3)
// console.log(syllables("deviled").length == 3)
// console.log(syllables("imitated").length == 4)
// console.log(syllables("horse").length == 1)

// console.log(syllables("carbonised"))
// console.log(syllables("sometimes"))
// console.log(syllables("calgary flames"))
// console.log(syllables("tree"))

//broken
// console.log(syllables("birchtree"))

//built with patterns+exceptions from https://en.wikipedia.org/wiki/British_spelling
// mainly,
// ise <-> ize
// our <-> or
// re <-> er
// ise <-> ice
// xion <-> tion
// logue <-> log
// ae <-> e
// eing -> ing
// illful -> ilful




var britishize = (function() {

	var main = function(str) {

		var patterns = [
			// ise -> ize
			{
				reg: /([^aeiou][iy])z(e|ed|es|ing)?$/,
				repl: '$1s$2',
				exceptions: []
			},
			// our -> or
			// {
			// 	reg: /(..)our(ly|y|ite)?$/,
			// 	repl: '$1or$2',
			// 	exceptions: []
			// },
			// re -> er
			// {
			// 	reg: /([^cdnv])re(s)?$/,
			// 	repl: '$1er$2',
			// 	exceptions: []
			// },
			// xion -> tion
			// {
			// 	reg: /([aeiou])xion([ed])?$/,
			// 	repl: '$1tion$2',
			// 	exceptions: []
			// },
			//logue -> log
			// {
			// 	reg: /logue$/,
			// 	repl: 'log',
			// 	exceptions: []
			// },
			// ae -> e
			// {
			// 	reg: /([o|a])e/,
			// 	repl: 'e',
			// 	exceptions: []
			// },
			//eing -> ing
			// {
			// 	reg: /e(ing|able)$/,
			// 	repl: '$1',
			// 	exceptions: []
			// },
			// illful -> ilful
			{
				reg: /([aeiou]+[^aeiou]+[aeiou]+)l(ful|ment|est|ing|or|er|ed)$/, //must be second-syllable
				repl: '$1ll$2',
				exceptions: []
			},
		]

		for (var i = 0; i < patterns.length; i++) {
			if (str.match(patterns[i].reg)) {
				//check for exceptions
				for (var o in patterns[i].exceptions) {
					if (str.match(patterns[i].exceptions[o])) {
						return str
					}
				}
				return str.replace(patterns[i].reg, patterns[i].repl)
			}
		}


		return str
	}

	if (typeof module !== "undefined" && module.exports) {
		exports.britishize = main;
	}
	return main
})()






/////////////////
//////////
//////////////
var americanize = (function() {

	var main = function(str) {

		var patterns = [
			// ise -> ize
			{
				reg: /([^aeiou][iy])s(e|ed|es|ing)?$/,
				repl: '$1z$2',
				exceptions: []
			},
			// our -> or
			{
				reg: /(..)our(ly|y|ite)?$/,
				repl: '$1or$2',
				exceptions: []
			},
			// re -> er
			{
				reg: /([^cdnv])re(s)?$/,
				repl: '$1er$2',
				exceptions: []
			},
			// xion -> tion
			{
				reg: /([aeiou])xion([ed])?$/,
				repl: '$1tion$2',
				exceptions: []
			},
			//logue -> log
			{
				reg: /logue$/,
				repl: 'log',
				exceptions: []
			},
			// ae -> e
			{
				reg: /([o|a])e/,
				repl: 'e',
				exceptions: []
			},
			//eing -> ing
			{
				reg: /e(ing|able)$/,
				repl: '$1',
				exceptions: []
			},
			// illful -> ilful
			{
				reg: /([aeiou]+[^aeiou]+[aeiou]+)ll(ful|ment|est|ing|or|er|ed)$/, //must be second-syllable
				repl: '$1l$2',
				exceptions: []
			},
		]

		for (var i = 0; i < patterns.length; i++) {
			if (str.match(patterns[i].reg)) {
				//check for exceptions
				for (var o in patterns[i].exceptions) {
					if (str.match(patterns[i].exceptions[o])) {
						return str
					}
				}
				return str.replace(patterns[i].reg, patterns[i].repl)
			}
		}


		return str
	}

	if (typeof module !== "undefined" && module.exports) {
		exports.americanize = main;
	}
	return main
})()


// console.log(americanize("synthesise")=="synthesize")
// console.log(americanize("synthesised")=="synthesized")
// console.log(americanize("synthesises")=="synthesizes")
// console.log(americanize("synthesising")=="synthesizing")
// console.log(americanize("analyse")=="analyze")
// console.log(americanize("analysed")=="analyzed")
// console.log(americanize("analysing")=="analyzing")
// console.log(americanize("poise")=="poise")
// console.log(americanize("poised")=="poised")
// console.log(americanize("colour")=="color")
// console.log(americanize("honour")=="honor")
// console.log(americanize("neighbour")=="neighbor")
// console.log(americanize("neighbourly")=="neighborly")
// console.log(americanize("savour")=="savor")
// console.log(americanize("savourly")=="savorly")
// console.log(americanize("favour")=="favor")
// console.log(americanize("favourite")=="favorite")
// console.log(americanize("theatre")=="theater")
// console.log(americanize("theatres")=="theaters")
// console.log(americanize("entendre")=="entendre")
// console.log(americanize("genre")=="genre")
// console.log(americanize("mediocre")=="mediocre")
// console.log(americanize("acre")=="acre")
// console.log(americanize("acres")=="acres")
// console.log(americanize("analogue")=="analog")
// console.log(americanize("homologue")=="homolog")
// console.log(americanize("anaemia")=="anemia")
// console.log(americanize("oestrogen")=="estrogen")
// console.log(americanize("ageing")=="aging")
// console.log(americanize("useable")=="usable")
// console.log(americanize("programme")=="programme")
// console.log(americanize("tonne")=="tonne")
// console.log(americanize("counsellor")=="counselor")
// console.log(americanize("traveller")=="traveler")
// console.log(americanize("labelled")=="labeled")
// console.log(americanize("cancelled")=="canceled")
// console.log(americanize("quarrelled")=="quarreled")
// console.log(americanize("signalling")=="signaling")
// console.log(americanize("modelling")=="modeling")
// console.log(americanize("travelling")=="traveling")
// console.log(americanize("willful")=="willful")
// console.log(americanize("filling")=="filling")
var word_rules = [{
        reg: /.[cts]hy$/i,
        pos: 'JJ',
        strength: 64,
        errors: 1,
        accuracy: '0.98'
    }, {
        reg: /.[st]ty$/i,
        pos: 'JJ',
        strength: 44,
        errors: 1,
        accuracy: '0.98'
    }, {
        reg: /.[lnr]ize$/i,
        pos: 'VB',
        strength: 91,
        errors: 2,
        accuracy: '0.98'
    }, {
        reg: /.[gk]y$/i,
        pos: 'JJ',
        strength: 113,
        errors: 3,
        accuracy: '0.97'
    }, {
    reg: /.fies$/i,
        pos: 'VB',
        strength: 30,
        errors: 1,
        accuracy: '0.97'
    }, {
        reg: /.some$/i,
        pos: 'JJ',
        strength: 34,
        errors: 1,
        accuracy: '0.97'
    }, {
        reg: /.[nrtumcd]al$/i,
        pos: 'JJ',
        strength: 513,
        errors: 16,
        accuracy: '0.97'
    }, {
        reg: /.que$/i,
        pos: 'JJ',
        strength: 26,
        errors: 1,
        accuracy: '0.96'
    }, {
        reg: /.[tnl]ary$/i,
        pos: 'JJ',
        strength: 87,
        errors: 4,
        accuracy: '0.95'
    }, {
        reg: /.[di]est$/i,
        pos: 'JJS',
        strength: 74,
        errors: 4,
        accuracy: '0.95'
    }, {
        reg: /^(un|de|re)\-[a-z]../i,
        pos: 'VB',
        strength: 44,
        errors: 2,
        accuracy: '0.95'
    }, {
        reg: /.lar$/i,
        pos: 'JJ',
        strength: 83,
        errors: 5,
        accuracy: '0.94'
    }, {
        reg: /[bszmp]{2}y/,
        pos: 'JJ',
        strength: 95,
        errors: 6,
        accuracy: '0.94'
    }, {
        reg: /.zes$/i,
        pos: 'VB',
        strength: 54,
        errors: 4,
        accuracy: '0.93'
    }, {
        reg: /.[icldtgrv]ent$/i,
        pos: 'JJ',
        strength: 214,
        errors: 14,
        accuracy: '0.93'
    }, {
        reg: /.[rln]ates$/i,
        pos: 'VBZ',
        strength: 74,
        errors: 5,
        accuracy: '0.93'
    }, {
        reg: /.[oe]ry$/i,
        pos: 'JJ',
        strength: 150,
        errors: 10,
        accuracy: '0.93'
    },

    {
        reg: /.[rdntk]ly$/i, ///****
        pos: 'RB',
        strength: 108,
        errors: 9,
        accuracy: '0.92'
    },

    {
        reg: /.[lsrnpb]ian$/i,
        pos: 'JJ',
        strength: 121,
        errors: 10,
        accuracy: '0.92'
    },
    {
        reg: /.[lnt]ial$/i,
        pos: 'JJ',
        strength: 0,
        errors: 0,
        accuracy: '0'
    }, {
        reg: /.[vrl]id$/i,
        pos: 'JJ',
        strength: 23,
        errors: 2,
        accuracy: '0.91'
    }, {
        reg: /.[ilk]er$/i,
        pos: 'JJR',
        strength: 167,
        errors: 17,
        accuracy: '0.90'
    }, {
        reg: /.ike$/i,
        pos: 'JJ',
        strength: 71,
        errors: 8,
        accuracy: '0.89'
    }, {
        reg: /.ends$/i,
        pos: 'VB',
        strength: 24,
        errors: 3,
        accuracy: '0.88'
    }, {
        reg: /.wards$/i,
        pos: 'RB',
        strength: 31,
        errors: 4,
        accuracy: '0.87'
    }, {
        reg: /.rmy$/i,
        pos: 'JJ',
        strength: 7,
        errors: 1,
        accuracy: '0.86'
    }, {
        reg: /.rol$/i,
        pos: 'NN',
        strength: 7,
        errors: 1,
        accuracy: '0.86'
    }, {
        reg: /.tors$/i,
        pos: 'NN',
        strength: 7,
        errors: 1,
        accuracy: '0.86'
    }, {
        reg: /.azy$/i,
        pos: 'JJ',
        strength: 7,
        errors: 1,
        accuracy: '0.86'
    }, {
        reg: /.where$/i,
        pos: 'RB',
        strength: 7,
        errors: 1,
        accuracy: '0.86'
    }, {
        reg: /.ify$/i,
        pos: 'VB',
        strength: 49,
        errors: 7,
        accuracy: '0.86'
    }, {
        reg: /.bound$/i,
        pos: 'JJ',
        strength: 22,
        errors: 3,
        accuracy: '0.86'
    }, {
        reg: /.ens$/i,
        pos: 'VB',
        strength: 42,
        errors: 6,
        accuracy: '0.86'
    }, {
        reg: /.oid$/i,
        pos: 'JJ',
        strength: 20,
        errors: 3,
        accuracy: '0.85'
    }, {
        reg: /.vice$/i,
        pos: 'NN',
        strength: 6,
        errors: 1,
        accuracy: '0.83'
    }, {
        reg: /.rough$/i,
        pos: 'JJ',
        strength: 6,
        errors: 1,
        accuracy: '0.83'
    }, {
        reg: /.mum$/i,
        pos: 'JJ',
        strength: 6,
        errors: 1,
        accuracy: '0.83'
    }, {
        reg: /.teen(th)?$/i,
        pos: 'CD',
        strength: 17,
        errors: 3,
        accuracy: '0.82'
    }, {
        reg: /.oses$/i,
        pos: 'VB',
        strength: 22,
        errors: 4,
        accuracy: '0.82'
    }, {
        reg: /.ishes$/i,
        pos: 'VB',
        strength: 21,
        errors: 4,
        accuracy: '0.81'
    }, {
        reg: /.ects$/i,
        pos: 'VB',
        strength: 30,
        errors: 6,
        accuracy: '0.80'
    }, {
        reg: /.tieth$/i,
        pos: 'CD',
        strength: 5,
        errors: 1,
        accuracy: '0.80'
    }, {
        reg: /.ices$/i,
        pos: 'NN',
        strength: 15,
        errors: 3,
        accuracy: '0.80'
    }, {
        reg: /.bles$/i,
        pos: 'VB',
        strength: 20,
        errors: 4,
        accuracy: '0.80'
    }, {
        reg: /.pose$/i,
        pos: 'VB',
        strength: 19,
        errors: 4,
        accuracy: '0.79'
    }, {
        reg: /.ions$/i,
        pos: 'NN',
        strength: 9,
        errors: 2,
        accuracy: '0.78'
    }, {
        reg: /.ean$/i,
        pos: 'JJ',
        strength: 32,
        errors: 7,
        accuracy: '0.78'
    }, {
        reg: /.[ia]sed$/i,
        pos: 'JJ',
        strength: 151,
        errors: 35,
        accuracy: '0.77'
    }, {
        reg: /.tized$/i,
        pos: 'VB',
        strength: 21,
        errors: 5,
        accuracy: '0.76'
    }, {
        reg: /.llen$/i,
        pos: 'JJ',
        strength: 8,
        errors: 2,
        accuracy: '0.75'
    }, {
        reg: /.fore$/i,
        pos: 'RB',
        strength: 8,
        errors: 2,
        accuracy: '0.75'
    }, {
        reg: /.ances$/i,
        pos: 'NN',
        strength: 8,
        errors: 2,
        accuracy: '0.75'
    }, {
        reg: /.gate$/i,
        pos: 'VB',
        strength: 23,
        errors: 6,
        accuracy: '0.74'
    }, {
        reg: /.nes$/i,
        pos: 'VB',
        strength: 27,
        errors: 7,
        accuracy: '0.74'
    }, {
        reg: /.less$/i,
        pos: 'RB',
        strength: 11,
        errors: 3,
        accuracy: '0.73'
    }, {
        reg: /.ried$/i,
        pos: 'JJ',
        strength: 22,
        errors: 6,
        accuracy: '0.73'
    }, {
        reg: /.gone$/i,
        pos: 'JJ',
        strength: 7,
        errors: 2,
        accuracy: '0.71'
    }, {
        reg: /.made$/i,
        pos: 'JJ',
        strength: 7,
        errors: 2,
        accuracy: '0.71'
    }, {
        reg: /.[pdltrkvyns]ing$/i,
        pos: 'JJ',
        strength: 942,
        errors: 280,
        accuracy: '0.70'
    }, {
        reg: /.tions$/i,
        pos: 'NN',
        strength: 71,
        errors: 21,
        accuracy: '0.70'
    }, {
        reg: /.tures$/i,
        pos: 'NN',
        strength: 16,
        errors: 5,
        accuracy: '0.69'
    }, {
        reg: /.ous$/i,
        pos: 'JJ',
        strength: 6,
        errors: 2,
        accuracy: '0.67'
    }, {
        reg: /.ports$/i,
        pos: 'NN',
        strength: 9,
        errors: 3,
        accuracy: '0.67'
    }, {
        reg: /. so$/i,
        pos: 'RB',
        strength: 3,
        errors: 1,
        accuracy: '0.67'
    }, {
        reg: /.ints$/i,
        pos: 'NN',
        strength: 11,
        errors: 4,
        accuracy: '0.64'
    }, {
        reg: /.[gt]led$/i,
        pos: 'JJ',
        strength: 16,
        errors: 7,
        accuracy: '0.56'
    }, {
        reg: /[aeiou].*ist$/i, //not sure about.. (eg anarchist)
        pos: 'JJ',
        strength: 0,
        errors: 0,
        accuracy: '0'
    }, {
        reg: /.lked$/i,
        pos: 'VB',
        strength: 16,
        errors: 7,
        accuracy: '0.56'
    }, {
        reg: /.fully$/i,
        pos: 'RB',
        strength: 13,
        errors: 6,
        accuracy: '0.54'
    }, {
        reg: /.*ould$/,
        pos: 'MD',
        strength: 3,
        errors: 0,
        accuracy: '0.00'
    },

    {
        reg: /^-?[0-9]+(.[0-9]+)?$/,
        pos: 'CD',
        strength: 1,
        errors: 1,
        accuracy: '0.00'
    },

    {
        reg: /[a-z]*\-[a-z]*\-/, //'more-than-real'
        pos: 'JJ',
        strength: 0,
        errors: 0,
        accuracy: '0.00'
    },

    //ugly handling of contractions

    {
        reg: /[a-z]'s$/i, //spencer's
        pos: 'NNO',
        strength: 1,
        errors: 0,
        accuracy: '0.00'
    }, {
        reg: /.'n$/i, //walk'n
        pos: 'VB',
        strength: 1,
        errors: 0,
        accuracy: '0.00'
    }, {
        reg: /.'re$/i, //they're
        pos: 'CP',
        strength: 1,
        errors: 0,
        accuracy: '0.00'
    }, {
        reg: /.'ll$/i, //they'll
        pos: 'MD',
        strength: 1,
        errors: 0,
        accuracy: '0.00'
    },{
        reg: /.'t$/i, //doesn't
        pos: 'VB',
        strength: 1,
        errors: 0,
        accuracy: '0.00'
    },


]

if (typeof module !== "undefined" && module.exports) {
    module.exports = word_rules;
}
// word suffixes with a high pos signal, generated with wordnet
//by spencer kelly spencermountain@gmail.com  2014
var wordnet_suffixes = (function() {

    var data = {
        "tion": "NN",
        "ness": "NN",
        "idae": "NN",
        "ceae": "NN",
        "ment": "NN",
        "lity": "NN",
        "ting": "JJ",
        "tree": "NN",
        "ring": "JJ",
        "ator": "NN",
        "logy": "NN",
        "alis": "NN",
        "stem": "NN",
        "ales": "NN",
        "osis": "NN",
        "itis": "NN",
        "aria": "NN",
        "unit": "NN",
        "atus": "NN",
        "ency": "NN",
        "wood": "NN",
        "nism": "NN",
        "weed": "NN",
        "lism": "NN",
        "nsis": "NN",
        "fern": "NN",
        "onia": "NN",
        "ella": "NN",
        "vein": "NN",
        "olia": "NN",
        "emia": "NN",
        "urus": "NN",
        "ides": "NN",
        "esis": "NN",
        "inus": "NN",
        "rium": "NN",
        "tive": "JJ",
        "eria": "NN",
        "aker": "NN",
        "tate": "VB",
        "able": "JJ",
        "ound": "VB",
        "dium": "NN",
        "bird": "NN",
        "city": "NN",
        "aris": "NN",
        "gist": "NN",
        "rate": "VB",
        "cher": "NN",
        "icus": "NN",
        "time": "RB",
        "illa": "NN",
        "anus": "NN",
        "rity": "NN",
        "uage": "NN",
        "atum": "NN",
        "over": "VB",
        "nium": "NN",
        "tomy": "NN",
        "wort": "NN",
        "vity": "NN",
        "vice": "NN",
        "cell": "NN",
        "lata": "NN",
        "rier": "NN",
        "ulus": "NN",
        "lium": "NN",
        "late": "VB",
        "tics": "NN",
        "tory": "JJ",
        "aphy": "NN",
        "iana": "NN",
        "tism": "NN",
        "iser": "NN",
        "thus": "NN",
        "esia": "NN",
        "bush": "NN",
        "nake": "NN",
        "root": "NN",
        "llus": "NN",
        "nity": "NN",
        "rmes": "NN",
        "icle": "NN",
        "bean": "NN",
        "nica": "NN",
        "erer": "NN",
        "orus": "NN",
        "ancy": "NN",
        "iner": "NN",
        "sity": "NN",
        "ysis": "NN",
        "leaf": "NN",
        "enia": "NN",
        "worm": "NN",
        "etry": "NN",
        "bone": "NN",
        "psis": "NN",
        "tera": "NN",
        "cope": "NN",
        "sman": "NN",
        "izer": "NN",
        "ayer": "NN",
        "irus": "NN",
        "eris": "NN",
        "rism": "NN",
        "lily": "NN",
        "rius": "NN",
        "back": "VB",
        "book": "NN",
        "rial": "JJ",
        "tica": "NN",
        "tein": "NN",
        "ctus": "NN",
        "nner": "NN",
        "asia": "NN",
        "horn": "NN",
        "moth": "NN",
        "cism": "NN",
        "cake": "NN",
        "rker": "NN",
        "etes": "NN",
        "alia": "NN",
        "ings": "NN",
        "drug": "NN",
        "area": "NN",
        "nate": "VB",
        "icum": "NN",
        "llum": "NN",
        "stry": "NN",
        "scle": "NN",
        "oner": "NN",
        "ania": "NN",
        "ader": "NN",
        "erus": "NN",
        "idea": "NN",
        "inia": "NN",
        "itor": "NN",
        "ilis": "NN",
        "alus": "NN",
        "ille": "NN",
        "game": "NN",
        "hair": "NN",
        "uria": "NN",
        "rina": "NN",
        "anum": "NN",
        "trum": "NN",
        "tude": "NN",
        "ngus": "NN",
        "opus": "NN",
        "rica": "NN",
        "chus": "NN",
        "body": "NN",
        "ncer": "NN",
        "ates": "NN",
        "auce": "NN",
        "bill": "NN",
        "tube": "NN",
        "tina": "NN",
        "osus": "NN",
        "card": "NN",
        "odon": "NN",
        "cana": "NN",
        "dity": "NN",
        "ions": "NN",
        "inum": "NN",
        "ntia": "NN",
        "eper": "NN",
        "llet": "NN",
        "xide": "NN",
        "enus": "NN",
        "inae": "NN",
        "agon": "NN",
        "chid": "NN",
        "etle": "NN",
        "zard": "NN",
        "ener": "NN",
        "boat": "NN",
        "chia": "NN",
        "ward": "RB",
        "lora": "NN",
        "poda": "NN",
        "otus": "NN",
        "tris": "NN",
        "iron": "NN",
        "acea": "NN",
        "orum": "NN",
        "hora": "NN",
        "toma": "NN",
        "icer": "NN",
        "ilus": "NN",
        "nson": "NN",
        "rpus": "NN",
        "bell": "NN",
        "rata": "NN",
        "lamp": "NN",
        "palm": "NN",
        "ourt": "NN",
        "rrel": "NN",
        "down": "VB",
        "dron": "NN",
        "mann": "NN",
        "elia": "NN",
        "obia": "NN",
        "gery": "NN",
        "iper": "NN",
        "star": "NN",
        "inea": "NN",
        "eman": "NN",
        "tium": "NN",
        "tata": "NN",
        "rgan": "NN",
        "ical": "JJ",
        "gate": "VB",
        "stic": "JJ",
        "hand": "RB",
        "sive": "JJ",
        "east": "RB",
        "etic": "JJ",
        "away": "VB",
        "cent": "JJ",
        "cate": "VB",
        "onal": "JJ",
        "ible": "JJ",
        "iate": "VB",
        "atic": "JJ",
        "onic": "JJ",
        "otic": "JJ",
        "ular": "JJ",
        "rise": "VB",
        "tric": "JJ",
        "ully": "RB",
        "erly": "RB",
        "ally": "RB",
        "shed": "JJ",
        "sted": "JJ",
        "less": "JJ",
        "lize": "VB",
        "lise": "VB",
        "nize": "VB",
        "rize": "VB",
        "nise": "VB",
        "tise": "VB",
        "tize": "VB",
        "mize": "VB",
        "into": "VB",
        "tify": "VB",
        "rify": "VB",
        "self": "VB",
        "esce": "VB",
        "duce": "VB",
        "cize": "VB",
        "dize": "VB",
        "gize": "VB",
        "gise": "VB",
        "nify": "VB",
        "ieve": "VB",
        "lify": "VB",
        "sify": "VB",
        "pend": "VB",
        "hise": "VB",
        "lude": "VB",
        "tend": "VB",
        "olve": "VB",
        "dify": "VB",
        "sise": "VB",
        "open": "VB",
        "eive": "VB",
        "cede": "VB",
        "cify": "VB",
        "hize": "VB",
        "lyse": "VB",
        "ruct": "VB",
        "lyze": "VB",
        "vize": "VB",
        "hten": "VB",
        "sess": "VB",
        "from": "VB",
        "sume": "VB",
        "inst": "VB",
        "join": "VB",
        "sorb": "VB",
        "gest": "VB",
        "-dye": "VB",
        "vene": "VB",
        "voke": "VB",
        "cuss": "VB",
        "cend": "VB",
        "make": "VB",
        "bute": "VB",
        "grow": "VB",
        "hend": "VB",
        "pute": "VB",
        "roil": "VB",
        "othe": "VB",
        "laze": "VB",
        "mote": "VB",
        "cute": "VB",
        "uise": "VB",
        "jure": "VB",
        "uire": "VB",
        "cook": "VB",
        "hind": "VB",
        "fend": "VB",
        "owse": "VB",
        "ooch": "VB",
        "mend": "VB",
        "vest": "VB",
        "dain": "VB",
        "rble": "VB",
        "tort": "VB",
        "uild": "VB",
        "quer": "VB",
        "ooze": "VB",
        "rude": "VB",
        "ulge": "VB",
        "weld": "VB",
        "uiet": "VB",
        "narl": "VB",
        "look": "VB",
        "efer": "VB",
        "elop": "VB",
        "pply": "VB",
        "lore": "VB",
        "draw": "VB",
        "lump": "VB",
        "lunk": "VB",
        "lame": "VB",
        "lign": "VB",
        "hink": "VB",
        "-fry": "VB",
        "ivel": "VB",
        "wrap": "VB",
        "vail": "VB",
        "till": "VB",
        "hack": "VB",
        "earn": "VB",
        "sult": "VB",
        "dime": "VB",
        "rlay": "VB",
        "mute": "VB",
        "ourn": "VB",
        "uess": "VB",
        "bify": "VB",
        "tink": "VB",
        "raid": "VB",
        "uize": "VB",
        "huck": "VB",
        "ccur": "VB",
        "vide": "VB",
        "anse": "VB",
        "hify": "VB",
        "xist": "VB",
        "rgle": "VB",
        "pare": "VB",
        "bind": "VB",
        "veil": "VB",
        "uote": "VB",
        "pond": "VB",
        "like": "JJ",
        "eels": "VB",
        "hear": "VB",
        "otle": "VB",
        "tect": "VB",
        "pret": "VB",
        "eact": "VB",
        "idle": "VB",
        "rbid": "VB",
        "xate": "VB",
        "surf": "VB",
        "ploy": "VB",
        "erit": "VB",
        "elay": "VB",
        "adow": "VB",
        "ceed": "VB",
        "raze": "VB",
        "vote": "VB",
        "mmit": "VB",
        "fest": "VB",
        "fill": "VB",
        "shen": "VB",
        "resh": "VB",
        "lict": "VB",
        "mify": "VB",
        "eset": "VB",
        "rump": "VB",
        "pugn": "VB",
        "feit": "VB",
        "vict": "VB",
        "elch": "VB",
        "oosh": "VB",
        "rken": "VB",
        "nect": "VB",
        "vade": "VB",
        "pick": "VB",
        "hirr": "VB",
        "ated": "JJ",
        "ered": "JJ",
        "ized": "JJ",
        "ised": "JJ",
        "aped": "JJ",
        "nted": "JJ",
        "nded": "JJ",
        "ined": "JJ",
        "ured": "JJ",
        "lled": "JJ",
        "phic": "JJ",
        "ored": "JJ",
        "ssed": "JJ",
        "aded": "JJ",
        "fied": "JJ",
        "cted": "JJ",
        "ched": "JJ",
        "rted": "JJ",
        "oned": "JJ",
        "ired": "JJ",
        "cked": "JJ",
        "ened": "JJ",
        "ited": "JJ",
        "eyed": "JJ",
        "pped": "JJ",
        "opic": "JJ",
        "osed": "JJ",
        "iled": "JJ",
        "ried": "JJ",
        "tted": "JJ",
        "aced": "JJ",
        "ytic": "JJ",
        "gged": "JJ",
        "nged": "JJ",
        "emic": "JJ",
        "eled": "JJ",
        "ared": "JJ",
        "thed": "JJ",
        "omic": "JJ",
        "aged": "JJ",
        "rmed": "JJ",
        "rned": "JJ",
        "aved": "JJ",
        "ided": "JJ",
        "oted": "JJ",
        "died": "JJ",
        "mmed": "JJ",
        "nned": "JJ",
        "oric": "JJ",
        "hted": "JJ",
        "rmal": "JJ",
        "rred": "JJ",
        "nced": "JJ",
        "owed": "JJ",
        "dled": "JJ",
        "amic": "JJ",
        "ased": "JJ",
        "used": "JJ",
        "rmic": "JJ",
        "dged": "JJ",
        "amed": "JJ",
        "iced": "JJ",
        "aled": "JJ",
        "-red": "JJ",
        "eted": "JJ",
        "hful": "JJ",
        "rved": "JJ",
        "aked": "JJ",
        "tled": "JJ",
        "obic": "JJ",
        "uted": "JJ",
        "lted": "JJ",
        "dial": "JJ",
        "omed": "JJ",
        "neal": "JJ",
        "d-up": "JJ",
        "gled": "JJ",
        "eded": "JJ",
        "bled": "JJ",
        "kish": "JJ",
        "oved": "JJ",
        "oded": "JJ",
        "ifth": "JJ",
        "afed": "JJ",
        "rnal": "JJ",
        "pled": "JJ",
        "ilic": "JJ",
        "pted": "JJ",
        "ived": "JJ",
        "smal": "JJ",
        "imed": "JJ",
        "five": "JJ",
        "wise": "RB",
        "made": "JJ",
        "oked": "JJ",
        "pish": "JJ",
        "rded": "JJ",
        "lied": "JJ",
        "kled": "JJ",
        "acal": "JJ",
        "lved": "JJ",
        "rful": "JJ",
        "atal": "JJ",
        "odic": "JJ",
        "bred": "JJ",
        "bbed": "JJ",
        "awed": "JJ",
        "yish": "JJ",
        "rked": "JJ",
        "ylic": "JJ",
        "obed": "JJ",
        "rged": "JJ",
        "chic": "JJ",
        "sial": "JJ",
        "smic": "JJ",
        "tchy": "JJ",
        "exed": "JJ",
        "oped": "JJ",
        "rgic": "JJ",
        "dded": "JJ",
        "geal": "JJ",
        "oxic": "JJ",
        "arly": "RB",
        "ayed": "JJ",
        "-one": "JJ",
        "utic": "JJ",
        "rbed": "JJ",
        "gish": "JJ",
        "worn": "JJ",
        "enal": "JJ",
        "rced": "JJ",
        "kian": "JJ",
        "abic": "JJ",
        "lear": "JJ",
        "sick": "JJ",
        "usty": "JJ",
        "llic": "JJ",
        "azed": "JJ",
        "rsed": "JJ",
        "atty": "JJ",
        "idic": "JJ",
        "-for": "JJ",
        "mbed": "JJ",
        "ghty": "JJ",
        "stly": "RB",
        "abby": "JJ",
        "vial": "JJ",
        "ocal": "JJ",
        "wned": "JJ",
        "ilar": "JJ",
        "nied": "JJ",
        "iful": "JJ",
        "wide": "JJ",
        "clic": "JJ",
        "appy": "JJ",
        "agic": "JJ",
        "cled": "JJ",
        "hree": "JJ",
        "oyed": "JJ",
        "ypic": "JJ",
        "ixed": "JJ",
        "lful": "JJ",
        "ushy": "JJ",
        "eedy": "JJ",
        "bial": "JJ",
        "rtal": "JJ",
        "mose": "JJ",
        "uric": "JJ",
        "near": "JJ",
        "icky": "JJ",
        "ibed": "JJ",
        "odal": "JJ",
        "umed": "JJ",
        "-day": "JJ",
        "-six": "JJ",
        "gual": "JJ",
        "uled": "JJ",
        "sual": "JJ",
        "nked": "JJ",
        "rled": "JJ",
        "aned": "JJ",
        "-two": "JJ",
        "dful": "JJ",
        "eaky": "JJ",
        "ofed": "JJ",
        "ubby": "JJ",
        "clad": "JJ",
        "aten": "JJ",
        "rdly": "RB",
        "odox": "JJ",
        "cose": "JJ",
        "lded": "JJ",
        "lial": "JJ",
        "fled": "JJ",
        "nown": "JJ",
        "ffed": "JJ",
        "uced": "JJ",
        "uded": "JJ",
        "-fed": "JJ",
        "mped": "JJ",
        "ingy": "JJ",
        "chal": "JJ",
        "vish": "JJ",
        "otal": "JJ",
        "uant": "JJ",
        "oled": "JJ",
        "zled": "JJ",
        "ugal": "JJ",
        "ctal": "JJ",
        "umpy": "JJ",
        "aggy": "JJ",
        "fted": "JJ",
        "ozen": "JJ",
        "ngly": "RB",
        "-old": "JJ",
        "bbly": "JJ",
        "knit": "JJ",
        "hmic": "JJ",
        "ewed": "JJ",
        "ippy": "JJ",
        "ssic": "JJ",
        "toed": "JJ",
        "nsed": "JJ",
        "otty": "JJ",
        "xial": "JJ",
        "hnic": "JJ",
        "ashy": "JJ",
        "hial": "JJ",
        "lown": "JJ",
        "rung": "JJ",
        "omal": "JJ",
        "unar": "JJ",
        "asal": "JJ",
        "wish": "JJ",
        "ylar": "JJ",
        "00th": "JJ",
        "oeic": "JJ",
        "teal": "JJ",
        "ifty": "JJ",
        "ifid": "JJ",
        "oggy": "JJ",
        "-cut": "JJ",
        "ymic": "JJ",
        "lked": "JJ",
        "lthy": "JJ",
        "assy": "JJ",
        "full": "JJ",
        "yant": "JJ",
        "ucky": "JJ",
        "gued": "JJ",
        "mely": "RB",
        "bral": "JJ",
        "sful": "JJ",
        "shod": "JJ",
        "neic": "JJ",
        "sked": "JJ",
        "nchy": "JJ",
        "urth": "JJ",
        "ccal": "JJ",
        "lued": "JJ",
        "mbic": "JJ",
        "itty": "JJ",
        "edth": "JJ",
        "ggly": "JJ",
        "mned": "JJ",
        "pied": "JJ",
        "axed": "JJ",
        "ecal": "JJ",
        "cile": "JJ",
        "tred": "JJ",
        "uffy": "JJ",
        "edic": "JJ",
        "anky": "JJ",
        "inct": "JJ",
        "asic": "JJ",
        "wept": "JJ",
        "-air": "JJ",
        "impy": "JJ",
        "eamy": "JJ",
        "-set": "JJ",
        "ltic": "JJ",
        "ishy": "JJ",
        "bous": "JJ",
        "tied": "JJ",
        "-ply": "JJ",
        "eval": "JJ",
        "cave": "JJ",
        "adic": "JJ",
        "ocky": "JJ",
        "icit": "JJ",
        "liar": "JJ",
        "wful": "JJ",
        "dern": "JJ",
        "xvii": "JJ",
        "hean": "JJ",
        "ossy": "JJ",
        "nvex": "JJ",
        "unky": "JJ",
        "roud": "JJ",
        "hral": "JJ",
        "angy": "JJ",
        "pant": "JJ",
        "eked": "JJ",
        "nnic": "JJ",
        "siac": "JJ",
        "esic": "JJ",
        "boid": "JJ",
        "rual": "JJ",
        "iffy": "JJ",
        "adal": "JJ",
        "dest": "JJ",
        "irty": "JJ",
        "kety": "JJ",
        "inty": "JJ",
        "lgic": "JJ",
        "hird": "JJ",
        "dric": "JJ",
        "gone": "JJ",
        "unct": "JJ",
        "t-up": "JJ",
        "raic": "JJ",
        "isty": "JJ",
        "paid": "JJ",
        "ilty": "JJ",
        "uing": "JJ",
        "zian": "JJ",
        "emal": "JJ",
        "gean": "JJ",
        "ixth": "JJ",
        "gful": "JJ",
        "eeny": "JJ",
        "easy": "JJ",
        "eged": "JJ",
        "-way": "JJ",
        "uddy": "JJ",
        "liac": "JJ",
        "lden": "JJ",
        "bose": "JJ",
        "iose": "JJ",
        "cive": "JJ",
        "tean": "JJ",
        "dral": "JJ",
        "eved": "JJ",
        "igid": "JJ",
        "llel": "JJ",
        "orty": "JJ",
        "ctyl": "JJ",
        "nkly": "JJ",
        "ghth": "JJ",
        "yric": "JJ",
        "-run": "JJ",
        "eian": "JJ",
        "eepy": "JJ",
        "tood": "JJ",
        "ltry": "JJ",
        "ubic": "JJ",
        "wery": "JJ",
        "nken": "JJ",
        "apen": "JJ",
        "mful": "JJ",
        "emed": "JJ",
        "gile": "JJ",
        "mart": "JJ",
        "yzed": "JJ",
        "alid": "JJ",
        "toic": "JJ",
        "-top": "JJ",
        "rtan": "JJ",
        "mant": "JJ",
        "ngry": "JJ",
        "eyan": "JJ",
        "yoid": "JJ",
        "urnt": "JJ",
        "urvy": "JJ",
        "tair": "JJ",
        "hoid": "JJ",
        "egic": "JJ",
        "moid": "JJ",
        "llan": "JJ",
        "tech": "JJ",
        "ulky": "JJ",
        "osey": "JJ",
        "orny": "JJ",
        "ormy": "JJ",
        "dual": "JJ",
        "oury": "JJ",
        "qual": "JJ",
        "teed": "JJ",
        "eezy": "JJ",
        "rdic": "JJ",
        "alky": "JJ",
        "afty": "JJ",
        "acky": "JJ",
        "ymed": "JJ",
        "yful": "JJ",
        "epid": "JJ",
        "unic": "JJ",
        "endo": "JJ",
        "ensy": "JJ",
        "iked": "JJ",
        "ghed": "JJ",
        "tuck": "JJ",
        "odly": "JJ",
        "iric": "JJ",
        "awny": "JJ",
        "udal": "JJ",
        "axic": "JJ",
        "awky": "JJ",
        "rbal": "JJ",
        "owsy": "JJ",
        "-key": "JJ",
        "-end": "JJ",
        "ammy": "JJ",
        "mune": "JJ",
        "ulic": "JJ",
        "izan": "JJ",
        "ndan": "JJ",
        "true": "JJ",
        "eery": "JJ",
        "zzly": "JJ",
        "eige": "JJ",
        "xxiv": "JJ",
        "odan": "JJ",
        "-toe": "JJ",
        "laid": "JJ",
        "utty": "JJ",
        "usky": "JJ",
        "issy": "JJ",
        "deaf": "JJ",
        "maic": "JJ",
        "vous": "JJ",
        "rpal": "JJ",
        "exic": "JJ",
        "soid": "JJ",
        "ucal": "JJ",
        "oopy": "JJ",
        "lmed": "JJ",
        "roic": "JJ",
        "cund": "JJ",
        "arse": "JJ",
        "vely": "RB",
        "uchy": "JJ",
        "ussy": "JJ",
        "d-on": "JJ",
        "izzy": "JJ",
        "pean": "JJ",
        "mane": "JJ",
        "etty": "JJ",
        "ebby": "JJ",
        "phal": "JJ",
        "odgy": "JJ",
        "ober": "JJ",
        "hoic": "JJ",
        "taic": "JJ",
        "oeal": "JJ",
        "cral": "JJ",
        "hewn": "JJ",
        "heal": "JJ",
        "xxii": "JJ",
        "ainy": "JJ",
        "apid": "JJ",
        "lowy": "JJ",
        "nlit": "JJ",
        "held": "JJ",
        "xxvi": "JJ",
        "inky": "JJ",
        "nsic": "JJ",
        "olid": "JJ",
        "eban": "JJ",
        "kful": "JJ",
        "siny": "JJ",
        "usly": "RB",
        "ably": "RB",
        "ntly": "RB",
        "edly": "RB",
        "tely": "RB",
        "ssly": "RB",
        "shly": "RB",
        "rily": "RB",
        "ibly": "RB",
        "idly": "RB",
        "tily": "RB",
        "sely": "RB",
        "rely": "RB",
        "dily": "RB",
        "kily": "RB",
        "hily": "RB",
        "nely": "RB",
        "ctly": "RB",
        "sily": "RB",
        "ways": "RB",
        "rtly": "RB",
        "pily": "RB",
        "gily": "RB",
        "itly": "RB",
        "nily": "RB",
        "zily": "RB",
        "lely": "RB",
        "etly": "RB",
        "uely": "RB",
        "adly": "RB",
        "much": "RB",
        "gely": "RB",
        "imly": "RB",
        "oubt": "RB",
        "vily": "RB",
        "ftly": "RB",
        "ptly": "RB",
        "chly": "RB",
        "owly": "RB",
        "cely": "RB",
        "rnly": "RB",
        "mply": "RB",
        "cily": "RB",
        "ghly": "RB",
        "that": "RB",
        "rmly": "RB",
        "dely": "RB",
        "high": "RB",
        "orst": "RB",
        "atly": "RB",
        "exly": "RB",
        "atim": "RB",
        "diem": "RB",
        "iori": "RB",
        "utly": "RB",
        "oors": "RB",
        "ffly": "RB",
        "udly": "RB",
        "bily": "RB"
    }
    if (typeof module !== "undefined" && module.exports) {
        module.exports = data;
    }
    return data;
})();
var parts_of_speech = (function() {

    var main = {

        //verbs
        "VB": {
            "name": "verb, generic",
            "example": "eat",
            "parent": "verb",
            "tag": "VB"
        },
        "VBD": {
            "name": "past-tense verb",
            "example": "ate",
            "parent": "verb",
            "tense": "past",
            "tag": "VBD"
        },
        "VBN": {
            "name": "past-participle verb",
            "example": "eaten",
            "parent": "verb",
            "tense": "past",
            "tag": "VBN"
        },
        "VBP": {
            "name": "infinitive verb",
            "example": "eat",
            "parent": "verb",
            "tense": "present",
            "tag": "VBP"
        },
        "VBZ": {
            "name": "present-tense verb",
            "example": "eats, swims",
            "tense": "present",
            "parent": "verb",
            "tag": "VBZ"
        },
        "CP": {
            "name": "copula",
            "example": "is, was, were",
            "parent": "verb",
            "tag": "CP"
        },
        "VBG": {
            "name": "gerund verb",
            "example": "eating,winning",
            "parent": "verb",
            "tag": "VBG"
        },


        //adjectives
        "JJ": {
            "name": "adjective, generic",
            "example": "big, nice",
            "parent": "adjective",
            "tag": "JJ"
        },
        "JJR": {
            "name": "comparative adjective",
            "example": "bigger, cooler",
            "parent": "adjective",
            "tag": "JJR"
        },
        "JJS": {
            "name": "superlative adjective",
            "example": "biggest, fattest",
            "parent": "adjective",
            "tag": "JJS"
        },


        //adverbs
        "RB": {
            "name": "adverb",
            "example": "quickly, softly",
            "parent": "adverb",
            "tag": "RB"
        },
        "RBR": {
            "name": "comparative adverb",
            "example": "faster, cooler",
            "parent": "adverb",
            "tag": "RBR"
        },
        "RBS": {
            "name": "superlative adverb",
            "example": "fastest (driving), coolest (looking)",
            "parent": "adverb",
            "tag": "RBS"
        },


        //nouns
        "NN": {
            "name": "noun, generic",
            "example": "dog, rain",
            "parent": "noun",
            "tag": "NN"
        },
        "NNP": {
            "name": "singular proper noun",
            "example": "Edinburgh, skateboard",
            "parent": "noun",
            "tag": "NNP"
        },
        "NNA": {
            "name": "noun, active",
            "example": "supplier, singer",
            "parent": "noun",
            "tag": "NNA"
        },
        "NNPA": {
            "name": "noun, acronym",
            "example": "FBI, N.A.S.A.",
            "parent": "noun",
            "tag": "NNPA"
        },
        "NNPS": {
            "name": "plural proper noun",
            "example": "Smiths",
            "parent": "noun",
            "tag": "NNPS"
        },
        "NNS": {
            "name": "plural noun",
            "example": "dogs, foxes",
            "parent": "noun",
            "tag": "NNS"
        },
        "NNO": {
            "name": "possessive noun",
            "example": "spencer's, sam's",
            "parent": "noun",
            "tag": "NNO"
        },
        "NNG": {
            "name": "gerund noun",
            "example": "eating,winning - but used grammatically as a noun",
            "parent": "noun",
            "tag": "VBG"
        },


        //glue
        "PP": {
            "name": "possessive pronoun",
            "example": "my,one's",
            "parent": "glue",
            "tag": "PP"
        },
        "FW": {
            "name": "foreign word",
            "example": "mon dieu, voila",
            "parent": "glue",
            "tag": "FW"
        },
        "CD": {
            "name": "cardinal value, generic",
            "example": "one, two, june 5th",
            "parent": "value",
            "tag": "CD"
        },
        "DA": {
            "name": "date",
            "example": "june 5th, 1998",
            "parent": "value",
            "tag": "DA"
        },
        "NU": {
            "name": "number",
            "example": "89, half-million",
            "parent": "value",
            "tag": "NU"
        },

        "IN": {
            "name": "preposition",
            "example": "of,in,by",
            "parent": "glue",
            "tag": "IN"
        },
        "MD": {
            "name": "modal verb",
            "example": "can,should",
            "parent": "verb", //dunno
            "tag": "MD"
        },
        "CC": {
            "name": "co-ordating conjunction",
            "example": "and,but,or",
            "parent": "glue",
            "tag": "CC"
        },
        "PRP": {
            "name": "personal pronoun",
            "example": "I,you,she",
            "parent": "noun",
            "tag": "PRP"
        },
        "DT": {
            "name": "determiner",
            "example": "the,some",
            "parent": "glue",
            "tag": "DT"
        },
        "UH": {
            "name": "interjection",
            "example": "oh, oops",
            "parent": "glue",
            "tag": "UH"
        },
        "EX": {
            "name": "existential there",
            "example": "there",
            "parent": "glue",
            "tag": "EX"
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = main;
    }

    return main
})()
var print_pos = function() {
    parents = {}
    Object.keys(parts_of_speech).forEach(function(k) {
        var parent = parts_of_speech[k].parent
        parents[parent] = parents[parent] || []
        parents[parent].push(k + '  - ' + parts_of_speech[k].name + ' (' + parts_of_speech[k].example + ')')
    })
    console.log(JSON.stringify(parents, null, 2));
}
// print_pos()
// converts spoken numbers into integers  "fifty seven point eight" -> 57.8
//
// Spoken numbers take the following format
// [sixty five] (thousand) [sixty five] (hundred) [sixty five]
// aka: [one/teen/ten] (multiple) [one/teen/ten] (multiple) ...
// combile the [one/teen/ten]s as 'current_sum', then multiply it by its following multiple
// multiples not repeat

var to_number = (function() {
  "use strict";
  //these sets of numbers each have different rules
  //[tenth, hundreth, thousandth..] are ambiguous because they could be ordinal like fifth, or decimal like one-one-hundredth, so are ignored
  var ones = { 'a': 1, 'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9}
  var teens={  'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, "eleventh": 11, "twelfth": 12, "thirteenth": 13, "fourteenth": 14, "fifteenth": 15, "sixteenth": 16, "seventeenth": 17, "eighteenth": 18, "nineteenth": 19 }
  var tens={ 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90, "twentieth": 20, "thirtieth": 30, "fourtieth": 40, "fiftieth": 50, "sixtieth": 60, "seventieth": 70, "eightieth": 80, "ninetieth":90 }
  var multiples = { 'hundred': 100, 'grand': 1000, 'thousand': 1000, 'million': 1000000, 'billion': 1000000000, 'trillion': 1000000000000, 'quadrillion': 1000000000000000, 'quintillion': 1000000000000000000, 'sextillion': 1000000000000000000000, 'septillion': 1000000000000000000000000, 'octillion': 1000000000000000000000000000, 'nonillion': 1000000000000000000000000000000, 'decillion': 1000000000000000000000000000000000}
  // var decimal_multiples={'tenth':0.1, 'hundredth':0.01, 'thousandth':0.001, 'millionth':0.000001,'billionth':0.000000001};


  var main = function(s) {
    //remember these concerns for possible errors
    var ones_done=false
    var teens_done=false
    var tens_done=false
    var multiples_done={}
    var total=0
    var global_multiplier=1
    //pretty-printed numbers
    s = s.replace(/, ?/g, '')
    //parse-out currency
    s=s.replace(/[$£€]/,'')
    //try to finish-fast
    if(s.match(/[0-9]\.[0-9]/) && parseFloat(s)==s){
      return parseFloat(s)
    }
    if(parseInt(s)==s){
      return parseInt(s)
    }
    //try to die fast. (phone numbers or times)
    if (s.match(/[0-9][-:][0-9]/)) {
        return null
    }

    //support global multipliers, like 'half-million' by doing 'million' then multiplying by 0.5
    var mults = [{
        reg: /^(minus|negative)[\s-]/i,
        mult: -1
    },{
        reg: /^(a\s)?half[\s-](of\s)?/i,
        mult: 0.5
    }, {
        reg: /^(a\s)?quarter[\s-]/i,
        mult: 0.25
    }]
    for(i=0; i<mults.length; i++){
      if(s.match(mults[i].reg)){
        global_multiplier=mults[i].mult
        s=s.replace(mults[i].reg,'')
        break
      }
    }

     //do each word in turn..
    var words = s.toString().split(/[\s-]+/);
    var w, x;
    var current_sum=0;
    var local_multiplier=1
    var decimal_mode=false
    for(var i =0; i<words.length; i++){
      w=words[i]

      //skip 'and' eg. five hundred and twelve
      if(w=="and"){continue}

      //..we're doing decimals now
      if(w=="point" || w=="decimal"){
        if(decimal_mode){return}//two point one point six
        decimal_mode=true
        total+=current_sum
        current_sum=0
        ones_done=false
        local_multiplier=0.1
        continue
      }

      //handle special rules following a decimal
      if(decimal_mode){
        x=null
        //allow consecutive ones in decimals eg. 'two point zero five nine'
        if(ones[w]!=null){ x=ones[w]}
        if(teens[w]!=null){ x=teens[w]}
        if(parseInt(w)==w){ x=parseInt(w)}
        if(!x){return }
        if(x<10){
          total+= x * local_multiplier
          local_multiplier=local_multiplier * 0.1 // next number is next decimal place
          current_sum=0
          continue
        }
        //two-digit decimals eg. 'two point sixteen'
        if(x<100){
          total+= x * (local_multiplier*0.1)
          local_multiplier=local_multiplier * 0.01 // next number is next decimal place
          current_sum=0
          continue
        }
      }

      //if it's already an actual number
      if(w.match(/^[0-9]\.[0-9]$/)){
        current_sum+=parseFloat(w)
        continue
      }
      if(parseInt(w)==w){
        current_sum+=parseInt(w)
        continue
      }


      //ones rules
      if(ones[w]!=null){
        if(ones_done){return }// eg. five seven
        if(teens_done){return }// eg. five seventeen
        ones_done=true
        current_sum+=ones[w]
        continue
      }
      //teens rules
      if(teens[w]){
        if(ones_done){return }// eg. five seventeen
        if(teens_done){return }// eg. fifteen seventeen
        if(tens_done){return }// eg. sixty fifteen
        teens_done=true
        current_sum+=teens[w]
        continue
      }
      //tens rules
      if(tens[w]){
        if(ones_done){return }// eg. five seventy
        if(teens_done){return }// eg. fiveteen seventy
        if(tens_done){return }// eg. twenty seventy
        tens_done=true
        current_sum+=tens[w]
        continue
      }
      //multiples rules
      if(multiples[w]){
        if(multiples_done[w]){return }// eg. five hundred six hundred
        multiples_done[w]=true
        //reset our concerns. allow 'five hundred five'
        ones_done=false
        teens_done=false
        tens_done=false
        //case of 'hundred million', (2 consecutive multipliers)
        if(current_sum==0){
          total= total || 1 //dont ever multiply by 0
          total*=multiples[w]
        }
        else{
          current_sum*= multiples[w]
          total+=current_sum
        }
        current_sum=0
        continue
      }
      //if word is not a known thing now, die
      return
    }
    if(current_sum){
        total+= (current_sum||1) * local_multiplier
    }
    //combine with global multiplier, like 'minus' or 'half'
    total= total * global_multiplier
    return total
  }

  //kick it into module
  if (typeof module !== "undefined" && module.exports) {
     module.exports = main;
  }
  return main;
})();




function run_tests(){
  tests=[
    ["twenty two thousand five hundred",22500],
    ["two thousand five hundred and sixty",2560],
    ["a hundred and two",102],
    ["a hundred",100],
    ["seven",7],
    ["seven grand",7000],
    ["half a million",500000],
    ["half-million",500000],
    ["quarter-million",250000],
    ["a quarter million",250000],
    ["a quarter-grand",250],
    ["104",104],
    ["13 thousand",13000],
    ["17,983",17983],
    ["12:32",null],
    ["123-1231",null],
    ["seven eleven",null],
    ["ten-four",null],
    ["one seven", null],
    ["one ten", null],
    ["one twelve", null],
    ["one thirty", null],
    ["nine fifty", null],
    ["five six", null],
    ["nine seventy", null],
    ["nine hundred", 900],
    ["nine two hundred", null],
    ["twenty one hundred", 2100],
    ["ten one", null],
    ["twelve one", null],
    ["twenty one", 21],
    ["seventy two", 72],
    ["seventy five two", null],
    ["two hundred two", 202],
    ["two hundred three hundred", null],
    ["one thousand one", 1001],
    ["minus five hundred", -500],
    ["minus fifteen", -15],
    ["five hundred million", 500000000],
    ["sixty fifteen hundred", null],
    ["$12.03", 12.03],
    ["$12", 12],
    ["5 hundred", 500],
    ["5.2 thousand", 5200],
    ["million",1000000],
    ["hundred one", 101],
    ["one twenty", null],
    ["twenty five twenty", null],
    ["", null],
    ["minus fifty", -50],
    ["twenty thousand", 20000],
    ["four point six", 4.6],
    ["nine hundred point five", 900.5],
    ["sixteen hundred sixteen point eight", 1616.8],
    ["four point seven nine", 4.79],
    ["four point sixteen", 4.16],
    ["twenty first", 21],
    ["fifty ninth", 59],
    ["nine hundred fiftieth", 950],
    ["four point six", 4.6],

    //hundredth, millionth, thousandth are ambiguous
    // ["two tenths", 0.2],
    // ["two thousandth", 0.002],
    // ["sixteen hundredth", 0.016],

    //this is tricky to do, but possible
    // ["four and a half", 4.5],
    // ["ten and a half million",15000000],

    // ["four point seven seven", 4.77], //??? shitbags javascipt float bug?
    // ["twenty hundred", null], //? there's an idiomatic rule against this, though technically fine.
    ]
    var r;
    tests.forEach(function(a){
        r=to_number(a[0])==a[1]
        if(!r){
            console.log('--'+a[0]+'--' + to_number(a[0]))
        }
        console.log(r)
    })
}
// run_tests()

// console.log(to_number("sixteen hundredth"))
// console.log(to_number("four point seven seven"))

// #generates properly-formatted dates from free-text date forms
// #by spencer kelly 2014

var date_extractor = (function() {
  "use strict";
  var months = "(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|aug|sept|oct|nov|dec),?";
  var days = "([0-9]{1,2}),?";
  var years = "([12][0-9]{3})";

  var to_obj = function(arr, places) {
    return Object.keys(places).reduce(function(h, k) {
      h[k] = arr[places[k]];
      return h;
    }, {});
  };

  var regexes = [
    {
      reg: "" + months + " " + days + "-" + days + " " + years,
      example: "March 7th-11th 1987",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          day: 2,
          to_day: 3,
          year: 4
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + days + " of " + months + " to " + days + " of " + months + ",? " + years,
      example: "28th of September to 5th of October 2008",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          day: 1,
          month: 2,
          to_day: 3,
          to_month: 4,
          to_year: 5
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + months + " " + days + " to " + months + " " + days + " " + years,
      example: "March 7th to june 11th 1987",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          day: 2,
          to_month: 3,
          to_day: 4,
          year: 5,
          to_year: 5
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "between " + days + " " + months + " and " + days + " " + months + " " + years,
      example: "between 13 February and 15 February 1945",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          day: 1,
          month: 2,
          to_day: 3,
          to_month: 4,
          year: 5,
          to_year: 5
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "between " + months + " " + days + " and " + months + " " + days + " " + years,
      example: "between March 7th and june 11th 1987",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          day: 2,
          to_month: 3,
          to_day: 4,
          year: 5,
          to_year: 5
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + months + " " + days + " " + years,
      example: "March 1st 1987",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          day: 2,
          year: 3
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + days + " - " + days + " of " + months + ",? " + years,
      example: "3rd - 5th of March 1969",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          day: 1,
          to_day: 2,
          month: 3,
          year: 4
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + days + " of " + months + ",? " + years,
      example: "3rd of March 1969",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          day: 1,
          month: 2,
          year: 3
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + months + " " + years + ",? to " + months + " " + years,
      example: "September 1939 to April 1945",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          year: 2,
          to_month: 3,
          to_year: 4
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + months + " " + years,
      example: "March 1969",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          year: 2
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + months + " " + days,
      example: "March 18th",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 1,
          day: 2
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + days + " of " + months,
      example: "18th of March",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          month: 2,
          day: 1
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + years + " ?- ?" + years,
      example: "1997-1998",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          year: 1,
          to_year: 2
        };
        return to_obj(arr, places);
      }
    }, {
      reg: "" + years,
      example: "1998",
      process: function(arr) {
        var places;
        if (arr == null) {
          arr = [];
        }
        places = {
          year: 1
        };
        return to_obj(arr, places);
      }
    }
  ].map(function(o) {
    o.reg = new RegExp(o.reg, "g");
    return o;
  });

  //0 based months, 1 based days...
  var months_obj = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    aug: 7,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11
  };

  //thirty days hath september...
  var last_dates = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  var preprocess = function(str) {
    str = str.toLowerCase();
    str = str.replace(/([0-9])(th|rd|st)/g, '$1');
    return str;
  };

  var postprocess = function(obj, options) {
    var d;
    d = new Date();
    options = options || {};
    obj.year = parseInt(obj.year) || undefined;
    obj.day = parseInt(obj.day) || undefined;
    obj.to_day = parseInt(obj.to_day) || undefined;
    obj.to_year = parseInt(obj.to_year) || undefined;
    obj.month = months_obj[obj.month];
    obj.to_month = months_obj[obj.to_month];
    //swap to_month and month
    if (obj.to_month !== undefined && obj.month === undefined) {
      obj.month = obj.to_month;
    }
    if (obj.to_month === undefined && obj.month !== undefined) {
      obj.to_month = obj.month;
    }
    //swap to_year and year
    if (obj.to_year && !obj.year) {
      obj.year = obj.to_year;
    }
    if (!obj.to_year && obj.year && obj.to_month!=undefined) {
      obj.to_year = obj.year;
    }
    if (options.assume_year && !obj.year) {
      obj.year = d.getFullYear();
    }
    //make sure date is in that month..
    if (obj.day !== undefined && (obj.day > 31 || (obj.month !== undefined && obj.day > last_dates[obj.month]))) {
      obj.day = undefined;
    }
    //make sure to date is after from date. fail everything if so...
    //todo: do this smarter
    if (obj.to_month !== undefined && obj.to_month < obj.month) {
      return {}
    }
    if (obj.to_year && obj.to_year < obj.year) {
      obj.year = undefined;
      obj.to_year = undefined;
    }

    //make sure date is in reasonable range (very opinionated)
    if (obj.year > 2090 || obj.year < 1200) {
      obj.year = undefined;
      obj.to_year = undefined;
    }
    //format result better
    obj = {
      day: obj.day,
      month: obj.month,
      year: obj.year,
      to: {
        day: obj.to_day,
        month: obj.to_month,
        year: obj.to_year
      }
    };
    //add javascript date objects, if you can
    if (obj.year && obj.day && obj.month !== undefined) {
      obj.date_object = new Date();
      obj.date_object.setYear(obj.year);
      obj.date_object.setMonth(obj.month);
      obj.date_object.setDate(obj.day);
    }
    if (obj.to.year && obj.to.day && obj.to.month !== undefined) {
      obj.to.date_object = new Date();
      obj.to.date_object.setYear(obj.to.year);
      obj.to.date_object.setMonth(obj.to.month);
      obj.to.date_object.setDate(obj.to.day);
    }
    //if we have enough data to return a result..
    if (obj.year || obj.month !== undefined) {
      return obj;
    }
    return {};
  };

  //pass through sequence of regexes until tempate is matched..
  var main = function(str, options) {
    var arr, good, obj, _i, _len;
    options = options || {};
    str = preprocess(str);
    for (_i = 0, _len = regexes.length; _i < _len; _i++) {
      obj = regexes[_i];
      if (str.match(obj.reg)) {
        arr = obj.reg.exec(str);
        good = obj.process(arr);
        good = postprocess(good, options);
        return good;
      }
    }
    return {};
  };

  //export modules
  if (typeof module !== "undefined" && module.exports) {
    module.exports = main;
  }
  return main;

})();


// var date_tests= [
//   ["March 7th-11th 1987",  {"month":2,"day":7,"year":1987}],
//   ["June 1st-11th 1999",  {"month":5,"day":1,"year":1999}],
//   ["28th of September to 5th of October 2008",  {"month":8,"day":28,"year":2008}],
//   ["2nd of January to 5th of October 2008",  {"month":9,"day":5,"year":2008}],
//   ["March 7th to june 11th 1987",  {"month":2,"day":7,"year":1987}],
//   ["April 17th to september 11th 1981",  {"month":3,"day":17,"year":1981}],
//   ["June 1st to June 11th 2014",  {"month":5,"day":1,"year":2014}],
//   ["between 13 February and 15 February 1945",  {"month":1,"day":13,"year":1945}],
//   ["between March 7th and june 11th 1987",  {"month":2,"day":7,"year":1987}],
//   ["March 1st 1987",  {"month":2,"day":1,"year":1987}],
//   ["June 22nd 2014",  {"month":5,"day":22,"year":undefined}],
//   ["June 22nd 1997",  {"month":5,"day":22,"year":undefined}],
//   ["3rd - 5th of March 1969",  {"month":2,"day":3,"year":1969}],
//   ["3rd of March 1969",  {"month":2,"day":3,"year":1969}],
//   ["2nd of April 1929",  {"month":3,"day":undefined,"year":1929}],
//   // ["September 1939 to April 1945",  {"month":undefined,"day":undefined,"year":1939}],
//   // ["June 1969 to April 1975",  {"month":undefined,"day":undefined,"year":1969}],
//   ["March 1969",  {"month":2,"day":undefined,"year":1969}],
//   ["March 18th",  {"month":2,"day":18,"year":undefined}],
//   ["August 28th",  {"month":7,"day":28,"year":undefined}],
//   ["18th of March",  {"month":2,"day":18,"year":undefined}],
//   ["27th of March",  {"month":2,"day":27,"year":undefined}],
//   ["2012-2014",  {"month":undefined,"day":undefined,"year":2012}],
//   ["1997-1998",  {"month":undefined,"day":undefined,"year":1997}],
//   ["1998",  {"month":undefined,"day":undefined,"year":1998}],
//   ["1672",  {"month":undefined,"day":undefined,"year":1672}],
//   ["2015",  {"month":undefined,"day":undefined,"year":2015}],
//   ["january 5th 1998",  {"month":0,"day":5,"year":1998}],

//   //edge cases
//   ["2014-1998",  {"month":undefined,"day":undefined,"year":undefined}],
//   ["february 10th",  {"month":1,"day":10,"year":undefined}],
//   ["february 30th",  {"month":1,"day":undefined,"year":undefined}],
//   ["2103",  {"month":undefined,"day":undefined,"year":undefined}],
//   ["1111",  {"month":undefined,"day":undefined,"year":undefined}],
//   ["jan 1921",  {"month":0,"day":undefined,"year":1921}],
//   ["",  {"month":undefined,"day":undefined,"year":undefined}],

// ]

// date_tests.forEach(function(arr) {
//   var o = date_extractor(arr[0]);
//   return Object.keys(arr[1]).forEach(function(k) {
//     if (arr[1][k] !== o[k]) {
//       return console.log(arr[1][k] + "  " + o[k]);
//     }
//   });
// });

// console.log(date_extractor("january 6th 1998"))
var Value = function(str, next, last, token) {
	var the = this
	the.word = str || '';

	if (typeof module !== "undefined" && module.exports) {
		to_number = require("./to_number")
		date_extractor = require("./date_extractor")
		parts_of_speech = require("../../data/parts_of_speech")
	}

	the.date = function(options) {
		options = options || {}
		return date_extractor(the.word, options)
	}

	the.is_date = function() {
		var months = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|aug|sept|oct|nov|dec)/i
		var times = /1?[0-9]:[0-9]{2}/
		var days = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|sat|sun)\b/i
		if (the.word.match(months) || the.word.match(times) || the.word.match(days)) {
			return true
		}
		return false
	}

	the.number = function() {
		if (the.is_date()) {
			return null
		}
		return to_number(the.word)
	}

	the.which = (function() {
		if (the.date()) {
			return parts_of_speech['DA']
		}
		if (the.number()) {
			return parts_of_speech['NU']
		}
		return parts_of_speech['CD']
	})()

	return the;
};
if (typeof module !== "undefined" && module.exports) {
	module.exports = Value;
}

// console.log(new Value("fifty five").number())
// console.log(new Value("sunday March 18th").date({
// 	assume_year: true
// }))
// console.log(new Value("june 5th 1998").date())
//chooses an indefinite aricle 'a/an' for a word
var indefinite_article = (function() {
	var main = function(str) {
		if (!str) {
			return null
		}
		var irregulars = {
			"hour": "an",
			"heir": "an",
			"heirloom": "an",
			"honest": "an",
			"honour": "an",
			"honor": "an",
			"uber": "an", //german u
		}

		var is_acronym = function(s) {
			//no periods
			if (s.length <= 5 && s.match(/^[A-Z]*$/)) {
				return true
			}
			//with periods
			if (s.length >= 4 && s.match(/^([A-Z]\.)*$/)) {
				return true
			}
			return false
		}

		//pronounced letters of acronyms that get a 'an'
		an_acronyms = {
			A: true,
			E: true,
			F: true,
			H: true,
			I: true,
			L: true,
			M: true,
			N: true,
			O: true,
			R: true,
			S: true,
			X: true,
		}

		//'a' regexes
		a_regexs = [
			/^onc?e/i, //'wu' sound of 'o'
			/^u[bcfhjkqrstn][aeiou]/i, // 'yu' sound for hard 'u'
			/^eul/i
		]

		//begin business time
		////////////////////
		//explicit irregular forms
		if (irregulars[str]) {
			return irregulars[str]
		}
		//spelled-out acronyms
		if (is_acronym(str) && an_acronyms[str.substr(0, 1)]) {
			return "an"
		}
		//'a' regexes
		for (var i = 0; i < a_regexs.length; i++) {
			if (str.match(a_regexs[i])) {
				return "a"
			}
		}
		//basic vowel-startings
		if (str.match(/^[aeiou]/i)) {
			return "an"
		}
		return "a"
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();


// console.log(indefinite_article("wolf") == "a")
// console.log(indefinite_article("eulogy") == "a")
// console.log(indefinite_article("eater") == "an")
// console.log(indefinite_article("african") == "an")
// console.log(indefinite_article("houri") == "a")
// console.log(indefinite_article("awful") == "an")
// console.log(indefinite_article("utter") == "an")
// console.log(indefinite_article('S.S.L.') == "an")
// console.log(indefinite_article('FBI') == "an")
// console.log(indefinite_article('GHQ') == "a")
//converts nouns from plural and singular, and viceversases
//some regex borrowed from pksunkara/inflect
//https://github.com/pksunkara/inflect/blob/master/lib/defaults.js

var inflect = (function() {

    var titlecase=function(str){
        if(str==null){return ''}
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    var irregulars = [
        ['child', 'children'],
        ['person', 'people'],
        ['leaf', 'leaves'],
        ['database', 'databases'],
        ['quiz', 'quizzes'],
        ['child', 'children'],
        ['stomach', 'stomachs'],
        ['sex', 'sexes'],
        ['move', 'moves'],
        ['shoe', 'shoes'],
        ["goose", "geese"],
        ["phenomenon", "phenomena"],
        ['barracks', 'barracks'],
        ['deer', 'deer'],
        ['syllabus', 'syllabi'],
        ['index', 'indices'],
        ['appendix', 'appendices'],
        ['criterion', 'criteria'],
        ['i', 'we'],
        ['person', 'people'],
        ['man', 'men'],
        ['move', 'moves'],
        ['she', 'they'],
        ['he', 'they'],
        ['myself', 'ourselves'],
        ['yourself', 'yourselves'],
        ['himself', 'themselves'],
        ['herself', 'themselves'],
        ['themself', 'themselves'],
        ['mine', 'ours'],
        ['hers', 'theirs'],
        ['his', 'theirs'],
        ['its', 'theirs'],
        ['theirs', 'theirs'],
        ['sex', 'sexes'],
        ['photo', 'photos'],
        ['video', 'videos'],
        ['narrative', 'narratives'],
        ['rodeo', 'rodeos'],
        ['gas', 'gases'],
        ['epoch', 'epochs'],
        ['zero', 'zeros'],
        ['avocado', 'avocados'],
        ['halo', 'halos'],
        ['tornado', 'tornados'],
        ['tuxedo', 'tuxedos'],
        ['sombrero', 'sombreros'],
    ]
    //words that shouldn't ever inflect, for metaphysical reasons
    var uncountables = {
        "aircraft": 1,
        "bass": 1,
        "bison": 1,
        "fowl": 1,
        "halibut": 1,
        "moose": 1,
        "salmon": 1,
        "spacecraft": 1,
        "tuna": 1,
        "trout": 1,
        "advice": 1,
        "help": 1,
        "information": 1,
        "knowledge": 1,
        "trouble": 1,
        "work": 1,
        "enjoyment": 1,
        "fun": 1,
        "recreation": 1,
        "relaxation": 1,
        "meat": 1,
        "rice": 1,
        "bread": 1,
        "cake": 1,
        "coffee": 1,
        "ice": 1,
        "water": 1,
        "oil": 1,
        "grass": 1,
        "hair": 1,
        "fruit": 1,
        "wildlife": 1,
        "equipment": 1,
        "machinery": 1,
        "furniture": 1,
        "mail": 1,
        "luggage": 1,
        "jewelry": 1,
        "clothing": 1,
        "money": 1,
        "mathematics": 1,
        "economics": 1,
        "physics": 1,
        "civics": 1,
        "ethics": 1,
        "gymnastics": 1,
        "mumps": 1,
        "measles": 1,
        "news": 1,
        "tennis": 1,
        "baggage": 1,
        "currency": 1,
        "travel": 1,
        "soap": 1,
        "toothpaste": 1,
        "food": 1,
        "sugar": 1,
        "butter": 1,
        "flour": 1,
        "progress": 1,
        "research": 1,
        "leather": 1,
        "wool": 1,
        "wood": 1,
        "coal": 1,
        "weather": 1,
        "homework": 1,
        "cotton": 1,
        "silk": 1,
        "patience": 1,
        "impatience": 1,
        "talent": 1,
        "energy": 1,
        "experience": 1,
        "vinegar": 1,
        "polish": 1,
        "air": 1,
        "alcohol": 1,
        "anger": 1,
        "art": 1,
        "beef": 1,
        "blood": 1,
        "cash": 1,
        "chaos": 1,
        "cheese": 1,
        "chewing": 1,
        "conduct": 1,
        "confusion": 1,
        "courage": 1,
        "damage": 1,
        "education": 1,
        "electricity": 1,
        "entertainment": 1,
        "fiction": 1,
        "forgiveness": 1,
        "gold": 1,
        "gossip": 1,
        "ground": 1,
        "happiness": 1,
        "history": 1,
        "honey": 1,
        "hope": 1,
        "hospitality": 1,
        "importance": 1,
        "jam": 1,
        "justice": 1,
        "laughter": 1,
        "leisure": 1,
        "lightning": 1,
        "literature": 1,
        "love": 1,
        "luck": 1,
        "melancholy": 1,
        "milk": 1,
        "mist": 1,
        "music": 1,
        "noise": 1,
        "oxygen": 1,
        "paper": 1,
        "pay": 1,
        "peace": 1,
        "peanut": 1,
        "pepper": 1,
        "petrol": 1,
        "plastic": 1,
        "pork": 1,
        "power": 1,
        "pressure": 1,
        "rain": 1,
        "recognition": 1,
        "sadness": 1,
        "safety": 1,
        "salt": 1,
        "sand": 1,
        "scenery": 1,
        "shopping": 1,
        "silver": 1,
        "snow": 1,
        "softness": 1,
        "space": 1,
        "speed": 1,
        "steam": 1,
        "sunshine": 1,
        "tea": 1,
        "thunder": 1,
        "time": 1,
        "traffic": 1,
        "trousers": 1,
        "violence": 1,
        "warmth": 1,
        "washing": 1,
        "wind": 1,
        "wine": 1,
        "steel": 1,
        "soccer": 1,
        "hockey": 1,
        "golf": 1,
        "fish": 1,
        "gum": 1,
        "liquid": 1,
        "series": 1,
        "sheep": 1,
        "species": 1,
        "fahrenheit": 1,
        "celcius": 1,
        "kelvin": 1,
        "hertz": 1,
    }

    var pluralize_rules = [{
        reg: /(ax|test)is$/i,
        repl: '$1es'
    }, {
        reg: /(octop|vir|radi|nucle|fung|cact|stimul)us$/i,
        repl: '$1i'
    }, {
        reg: /(octop|vir)i$/i,
        repl: '$1i'
    }, {
        reg: /([rl])f$/i,
        repl: '$1ves'
    }, {
        reg: /(alias|status)$/i,
        repl: '$1es'
    }, {
        reg: /(bu)s$/i,
        repl: '$1ses'
    }, {
        reg: /(al|ad|at|er|et|ed|ad)o$/i,
        repl: '$1oes'
    }, {
        reg: /([ti])um$/i,
        repl: '$1a'
    }, {
        reg: /([ti])a$/i,
        repl: '$1a'
    }, {
        reg: /sis$/i,
        repl: 'ses'
    }, {
        reg: /(?:([^f])fe|([lr])f)$/i,
        repl: '$1ves'
    }, {
        reg: /(hive)$/i,
        repl: '$1s'
    }, {
        reg: /([^aeiouy]|qu)y$/i,
        repl: '$1ies'
    }, {
        reg: /(x|ch|ss|sh|s|z)$/i,
        repl: '$1es'
    }, {
        reg: /(matr|vert|ind|cort)(ix|ex)$/i,
        repl: '$1ices'
    }, {
        reg: /([m|l])ouse$/i,
        repl: '$1ice'
    }, {
        reg: /([m|l])ice$/i,
        repl: '$1ice'
    }, {
        reg: /^(ox)$/i,
        repl: '$1en'
    }, {
        reg: /^(oxen)$/i,
        repl: '$1'
    }, {
        reg: /(quiz)$/i,
        repl: '$1zes'
    }, {
        reg: /(antenn|formul|nebul|vertebr|vit)a$/i,
        repl: '$1ae'
    }, {
        reg: /(sis)$/i,
        repl: 'ses'
    }, {
        reg: /^(?!talis|.*hu)(.*)man$/i,
        repl: '$1men'
    },
      //fallback, add an s
    {
        reg: /(.*)/i,
        repl: '$1s'
    }

    ]

    var pluralize = function(str) {
        var low = str.toLowerCase()
        //uncountable
        if (uncountables[low]) {
            return str
        }
        //irregular
        var found = irregulars.filter(function(r) {
            return r[0] == low
        })
        if (found[0]) {
            if (titlecase(low) == str) { //handle capitalisation properly
                return titlecase(found[0][1])
            } else {
                return found[0][1]
            }
        }
        //inflect first word of preposition-phrase
        if (str.match(/([a-z]*) (of|in|by|for) [a-z]/)) {
            var first = (str.match(/^([a-z]*) (of|in|by|for) [a-z]/)||[])[1]
            if (first) {
                var better_first = pluralize(first)
                return better_first + str.replace(first, '')
            }
        }
        //regular
        for (var i in pluralize_rules) {
            if (str.match(pluralize_rules[i].reg)) {
                return str.replace(pluralize_rules[i].reg, pluralize_rules[i].repl)
            }
        }
    }


    var singularize_rules = [{
        reg: /([^v])ies$/i,
        repl: '$1y'
    }, {
        reg: /ises$/i,
        repl: 'isis'
    }, {
        reg: /ives$/i,
        repl: 'ife'
    }, {
        reg: /(antenn|formul|nebul|vertebr|vit)ae$/i,
        repl: '$1a'
    }, {
        reg: /(octop|vir|radi|nucle|fung|cact|stimul)(i)$/i,
        repl: '$1us'
    }, {
        reg: /(buffal|tomat|tornad)(oes)$/i,
        repl: '$1o'
    }, {
        reg: /((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i,
        repl: '$1sis'
    }, {
        reg: /(vert|ind|cort)(ices)$/i,
        repl: '$1ex'
    }, {
        reg: /(matr|append)(ices)$/i,
        repl: '$1ix'
    }, {
        reg: /(x|ch|ss|sh|s|z|o)es$/i,
        repl: '$1'
    }, {
        reg: /men$/i,
        repl: 'man'
    }, {
        reg: /(n)ews$/i,
        repl: '$1ews'
    }, {
        reg: /([ti])a$/i,
        repl: '$1um'
    }, {
        reg: /([^f])ves$/i,
        repl: '$1fe'
    }, {
        reg: /([lr])ves$/i,
        repl: '$1f'
    }, {
        reg: /([^aeiouy]|qu)ies$/i,
        repl: '$1y'
    }, {
        reg: /(s)eries$/i,
        repl: '$1eries'
    }, {
        reg: /(m)ovies$/i,
        repl: '$1ovie'
    }, {
        reg: /([m|l])ice$/i,
        repl: '$1ouse'
    }, {
        reg: /(cris|ax|test)es$/i,
        repl: '$1is'
    }, {
        reg: /(alias|status)es$/i,
        repl: '$1'
    },{
        reg: /(ss)$/i,
        repl: '$1'
    }, {
        reg: /(ics)$/i,
        repl: "$1"
    },
    //fallback, remove last s
    {
        reg: /s$/i,
        repl: ''
    }
    ]


    var singularize = function(str) {
        var low = str.toLowerCase()
        //uncountable
        if (uncountables[low]) {
            return str
        }
        //irregular
        var found = irregulars.filter(function(r) {
            return r[1] == low
        })
        if (found[0]) {
            if (titlecase(low) == str) { //handle capitalisation properly
                return titlecase(found[0][0])
            } else {
                return found[0][0]
            }
        }
        //inflect first word of preposition-phrase
        if (str.match(/([a-z]*) (of|in|by|for) [a-z]/)) {
            var first = str.match(/^([a-z]*) (of|in|by|for) [a-z]/)
            if (first && first[1]) {
                var better_first = singularize(first[1])
                return better_first + str.replace(first[1], '')
            }
        }
        //regular
        for (var i in singularize_rules) {
            if (str.match(singularize_rules[i].reg)) {
                return str.replace(singularize_rules[i].reg, singularize_rules[i].repl)
            }
        }
        return str
    }


    var is_plural = function(str) {
        //if it's a known verb
        for (var i = 0; i < irregulars.length; i++) {
            if (irregulars[i][1] == str) {
                return true
            }
            if (irregulars[i][0] == str) {
                return false
            }
        }
        //if it changes when singularized
        if (singularize(str)!=str) {
            return true
        }
        //'looks pretty plural' rules
        if(str.match(/s$/) && !str.match(/ss$/) && str.length>3){//needs some lovin'
          return true
        }
        return false
    }

    var inflect = function(str) {
        if(uncountables[str]){//uncountables shouldn't ever inflect
            return {
                plural:str,
                singular:str
            }
        }
        if (is_plural(str)) {
            return {
                plural: str,
                singular: singularize(str),
            }
        } else {
            return {
                singular: str,
                plural: pluralize(str)
            }
        }
    }

    var methods = {
        inflect: inflect,
        is_plural: is_plural,
        singularize: singularize,
        pluralize: pluralize
    }
    if (typeof module !== "undefined" && module.exports) {
        module.exports = methods;
    }
    return methods;
})();

// console.log(inflect.pluralize('kiss'))
// console.log(inflect.pluralize('twin'))
// console.log(inflect.pluralize('phantom of the opera'))
// console.log(inflect.pluralize('mayor of chicago'))
// console.log(inflect.pluralize('boy in the mall'))
// console.log(inflect.pluralize('maple leaf'))
// console.log(inflect.singularize('leaves'))
// console.log(inflect.inflect('mayor of toronto'))
// console.log(inflect.inflect('mayors of kansas'))
// console.log(inflect.inflect('mayors of niagra falls'))
// console.log(inflect.pluralize('woman'))
// console.log(inflect.singularize('women'))
// console.log(inflect.inflect('women'))
// console.log(inflect.inflect('kiss'))
// console.log(inflect.inflect('news'))

// console.log(inflect.inflect('bus'))
// console.log(inflect.inflect('statistics'))

// bus
// kiss
// console.log(nlp.noun('crisis').pluralize() == 'crises')
// console.log(nlp.noun('analysis').pluralize() == 'analyses')
// console.log(nlp.noun('neurosis').pluralize() == 'neuroses')

// console.log(inflect.singularize('Indices')=='Index')
// console.log(inflect.singularize('indices')=='index')
// console.log(inflect.pluralize('index')=='indices')
// console.log(inflect.pluralize('Index')=='Indices')
// console.log(inflect.inflect('Indices').singular=='Index')
// console.log(inflect.inflect('indices').singular=='index')
// console.log(inflect.inflect('index').plural=='indices')
// console.log(inflect.inflect('Index').plural=='Indices')

var Noun = function(str, next, last, token) {
	var the = this
	the.word = str || '';
	the.next = next
	the.last = last

	if (typeof module !== "undefined" && module.exports) {
		parts_of_speech = require("../../data/parts_of_speech")
		inflect = require("./conjugate/inflect")
		indefinite_article = require("./indefinite_article/indefinite_article")
		// is_entity = require("./ner/is_entity")
	}
	//personal pronouns
	var prps = {
		"it": "PRP",
		"they": "PRP",
		"i": "PRP",
		"them": "PRP",
		"you": "PRP",
		"she": "PRP",
		"me": "PRP",
		"he": "PRP",
		"him": "PRP",
		"her": "PRP",
		"us": "PRP",
		"we": "PRP",
		"thou": "PRP",
	}

	the.is_acronym = (function() {
		var s = the.word
		//no periods
		if (s.length <= 5 && s.match(/^[A-Z]*$/)) {
			return true
		}
		//with periods
		if (s.length >= 4 && s.match(/^([A-Z]\.)*$/)) {
			return true
		}
		return false
	})()


	the.is_entity= (function(){
		if(!token){
			return false
		}
		var blacklist = {
	    "itself": 1,
	    "west": 1,
	    "western": 1,
	    "east": 1,
	    "eastern": 1,
	    "north": 1,
	    "northern": 1,
	    "south": 1,
	    "southern": 1,
	    "the": 1,
	    "one": 1,
	    "your": 1,
	    "my": 1,
	    "today": 1,
	    "yesterday": 1,
	    "tomorrow": 1,
	    "era": 1,
	    "century": 1,
	    "it":1
	  }
	  //prepositions
	  if(prps[token.normalised]){
	  	return false
	  }
	  //blacklist
	  if(blacklist[token.normalised]){
	  	return false
	  }
	  //discredit specific nouns forms
	  if(token.pos){
	   if(token.pos.tag=="NNA"){//eg. 'singer'
	  		return false
			}
	   if(token.pos.tag=="NNO"){//eg. "spencer's"
	  		return false
			}
	   if(token.pos.tag=="NNG"){//eg. 'walking'
	  		return false
			}
	   if(token.pos.tag=="NNP"){//yes! eg. 'Edinburough'
	  		// return true
			}
	  }
	  //distinct capital is very good signal
		if(token.special_capitalised){
			return true
		}
	  //multiple-word nouns are very good signal
		if(token.normalised.match(/ /)){
			return true
		}
	  //if it has an abbreviation, like 'business ltd.'
		if(token.normalised.match(/\./)){
			return true
		}
	  //acronyms are a-ok
		if(the.is_acronym){
			return true
		}
		//else, be conservative
		return false
	})()

	the.conjugate = function() {
		return inflect.inflect(the.word)
	},

	the.is_plural = (function() {
		return inflect.is_plural(the.word)
	})()

	the.article = function() {
		return indefinite_article(the.word)
	}

	the.pluralize = function() {
		return (inflect.inflect(the.word) || {}).plural
	}
	the.singularize = function() {
		return (inflect.inflect(the.word) || {}).singular
	}

	//specifically which pos it is
	the.which = (function() {
		//posessive
		if (the.word.match(/'s$/)) {
			return parts_of_speech['NNO']
		}
		//noun-gerund
		if (the.word.match(/..ing$/)) {
			return parts_of_speech['NNG']
		}
		//personal pronoun
		if (prps[the.word]) {
			return parts_of_speech['PRP']
		}
		//proper nouns
		var first = the.word.substr(0, 1)
		if (first.toLowerCase() != first) {
			if (the.is_acronym) {
				return parts_of_speech['NNPA']
			}
			if (the.is_plural) {
				return parts_of_speech['NNPS']
			}
			return parts_of_speech['NNP']
		}
		//plural
		if (the.is_plural) {
			return parts_of_speech['NNS']
		}
		//generic
		return parts_of_speech['NN']
	})()


	return the;
}
if (typeof module !== "undefined" && module.exports) {
	module.exports = Noun;
}


// console.log(new Noun('farmhouse').is_entity)
// console.log(new Noun("FBI").is_acronym)
// console.log(new Noun("FBI").which)
// console.log(new Noun("kitchen's").which)
// console.log(new Noun("he").which)
// console.log(new Noun("Flanders").which)
// console.log(new Noun("walking").which)
// console.log(new Noun("women").singularize())
//turns 'quickly' into 'quick'
var to_adjective = (function() {
	var main = function(str) {
		var irregulars = {
			"idly": "idle",
			"sporadically": "sporadic",
			"basically": "basic",
			"grammatically": "grammatical",
			"alphabetically": "alphabetical",
			"economically": "economical",
			"conically": "conical",
			"politically": "political",
			"vertically": "vertical",
			"practically": "practical",
			"theoretically": "theoretical",
			"critically": "critical",
			"fantastically": "fantastic",
			"mystically": "mystical",
			"pornographically": "pornographic",
			"fully": "full",
			"jolly": "jolly",
			"wholly": "whole",
		}
		var transforms = [{
			reg: /bly$/i,
			repl: 'ble',
		}, {
			reg: /gically$/i,
			repl: 'gical',
		}, {
			reg: /([rsdh])ically$/i,
			repl: '$1ical',
		}, {
			reg: /ically$/i,
			repl: 'ic',
		}, {
			reg: /uly$/i,
			repl: 'ue',
		}, {
			reg: /ily$/i,
			repl: 'y',
		}, {
			reg: /(.{3})ly$/i,
			repl: '$1',
		}, ]
		if (irregulars[str]) {
			return irregulars[str]
		}
		for (var i = 0; i < transforms.length; i++) {
			if (str.match(transforms[i].reg)) {
				return str.replace(transforms[i].reg, transforms[i].repl)
			}
		}
		return str
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();

// console.log(to_adjective('quickly') == 'quick')
// console.log(to_adjective('marvelously') == 'marvelous')
// console.log(to_adjective('marvelously') == 'marvelous')

// data = require("./test").data
// data = data.filter(function(w) {
// 	return to_adjective(w[0]) != w[1]
// })

// arr = data.map(function(w) {
// 	console.log(w[0] + " -  " + to_adjective(w[0]))
// })
// "RB  - adverb (quickly, softly)",
// "RBR  - comparative adverb (faster, cooler)",
// "RBS  - superlative adverb (fastest (driving), coolest (looking))"
var Adverb = function(str, next, last, token) {
	var the = this
	the.word = str || '';
	the.next = next
	the.last = last

	if (typeof module !== "undefined" && module.exports) {
		to_adjective = require("./conjugate/to_adjective")
		parts_of_speech = require("../../data/parts_of_speech")
	}


	the.conjugate = function() {
		return {
			adjective: to_adjective(the.word)
		}
	}
	the.which = (function() {
		if (the.word.match(/..est$/)) {
			return parts_of_speech['RBS']
		}
		if (the.word.match(/..er$/)) {
			return parts_of_speech['RBR']
		}
		return parts_of_speech['RB']
	})()

	return the;
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = Adverb;
}

// console.log(new Adverb("suddenly").conjugate())
// console.log(a)
// console.log(adverbs.conjugate('powerfully'))
var verb_rules = {

	infinitive: [


		{
			reg: /(eed)$/i,
			repl: {
				present: "$1s",
				gerund: "$1ing",
				past: "$1ed",
				doer: "$1er",
			},
			examples: 'sleep',
			exceptions: [],
			power: 1,
			tense: 'infinitive'
		},
		{
			reg: /(e)(ep)$/i,
			repl: {
				present: "$1$2s",
				gerund: "$1$2ing",
				past: "$1pt",
				doer: "$1$2er",
			},
			examples: 'sleep',
			exceptions: [],
			power: 1,
			tense: 'infinitive'
		},
		{
			reg: /([a[tg]|i[zn]]|ur|nc|gl|is)e$/i,
			repl: {
				present: "$1es",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'angulate, stipulate, orientate',
			exceptions: ["ate", "overate"],
			power: 804,
			tense: 'infinitive'
		}, {
			reg: /([i|f|rr])y$/i,
			repl: {
				present: "$1ies",
				gerund: "$1ying",
				past: "$1ied"
			},
			examples: 'unify, classify, glorify',
			exceptions: [],
			power: 128,
			tense: 'infinitive'
		}, {
			reg: /([td]er)$/i,
			repl: {
				present: "$1s",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'sputter, fritter, charter',
			exceptions: [],
			power: 123,
			tense: 'infinitive'
		}, {
			reg: /([bd])le$/i,
			repl: {
				present: "$1es",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'shamble, warble, grabble',
			exceptions: [],
			power: 69,
			tense: 'infinitive'
		}, {
			reg: /(ish|tch|ess)$/i,
			repl: {
				present: "$1es",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'relish, wish, brandish',
			exceptions: [],
			power: 62,
			tense: 'infinitive'
		}, {
			reg: /(ion|end|e[nc]t)$/i,
			repl: {
				present: "$1s",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'caution, aircondition, cushion',
			exceptions: ["sent", "bent", "overspent", "misspent", "went", "kent", "outwent", "forwent", "spent", "pent", "lent", "underwent", "rent", "unbent", "shent"],
			power: 55,
			tense: 'infinitive'
		}, {
			reg: /(om)e$/i,
			repl: {
				present: "$1es",
				gerund: "$1ing",
				past: "ame",
			},
			examples: 'become',
			exceptions: [],
			power: 1,
			tense: 'infinitive'
		}, {
			reg: /([aeiou])([ptn])$/i,//has a bug
			repl: {
				present: "$1$2s",
				gerund: "$1$2$2ing",
				past: "$1$2",
			},
			examples: 'win',
			exceptions: [],
			power: 1,
			tense: 'infinitive'
		},

		{
			reg: /(er)$/i,
			repl: {
				present: "$1s",
				gerund: "$1ing",
				past: "$1ed",
			},
			examples: 'win',
			exceptions: [],
			power: 1,
			tense: 'infinitive'
		}
	],

	present: [

		{
			reg: /([tzlshicgrvdnkmu])es$/i,
			repl: {
				infinitive: "$1e",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'convolutes, angulates, stipulates',
			exceptions: [],
			power: 923,
			tense: 'present'
		}, {
			reg: /(n[dtk]|c[kt]|[eo]n|i[nl]|er|a[ytrl])s$/i,
			repl: {
				infinitive: "$1",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'wants, squints, garments',
			exceptions: [],
			power: 153,
			tense: 'present'
		}, {
			reg: /(ow)s$/i,
			repl: {
				infinitive: "$1",
				gerund: "$1ing",
				past: "ew"
			},
			examples: 'wants, squints, garments',
			exceptions: [],
			power: 153,
			tense: 'present'
		}, {
			reg: /(op)s$/i,
			repl: {
				infinitive: "$1",
				gerund: "$1ping",
				past: "$1ped"
			},
			examples: 'wants, squints, garments',
			exceptions: [],
			power: 153,
			tense: 'present'
		}, {
			reg: /([eirs])ts$/i,
			repl: {
				infinitive: "$1t",
				gerund: "$1tting",
				past: "$1tted"
			},
			examples: 'outwits, revisits, knits',
			exceptions: [],
			power: 105,
			tense: 'present'
		}, {
			reg: /(ll)s$/i,
			repl: {
				infinitive: "$1",
				gerund: "$1ing",
				past: "$1ed"
			},
			examples: 'culls, tolls, shalls',
			exceptions: [],
			power: 92,
			tense: 'present'
		}, {
			reg: /(el)s$/i,
			repl: {
				infinitive: "$1",
				gerund: "$1ling",
				past: "$1led"
			},
			examples: 'swivels, rebels, travels',
			exceptions: [],
			power: 88,
			tense: 'present'
		}, {
			reg: /s$/i, //generic one
			repl: {
				infinitive: "",
				gerund: "ing",
				past: "ed"
			},
			examples: 'swivels, rebels, travels',
			exceptions: [],
			power: 88,
			tense: 'present'
		},
	],

	gerund: [

		//doubles  l|p|t|g|s
		{
			reg: /pping$/i,
			repl: {
				infinitive: "p",
				present: "ps",
				past: "pped"
			},
			examples: 'clipping',
			exceptions: [],
			tense: 'gerund'
		}, {
			reg: /lling$/i,
			repl: {
				infinitive: "ll",
				present: "lls",
				past: "lled"
			},
			examples: 'yelling',
			exceptions: [],
			tense: 'gerund'
		}, {
			reg: /tting$/i,
			repl: {
				infinitive: "t",
				present: "ts",
				past: "t"
			},
			examples: 'quitting',
			exceptions: [],
			tense: 'gerund'
		}, {
			reg: /ssing$/i,
			repl: {
				infinitive: "ss",
				present: "sses",
				past: "ssed"
			},
			examples: 'confessing',
			exceptions: [],
			tense: 'gerund'
		}, {
			reg: /gging$/i,
			repl: {
				infinitive: "g",
				present: "gs",
				past: "gged"
			},
			examples: 'jogging',
			exceptions: [],
			tense: 'gerund'
		},

		//lying
		{
			reg: /([^aeiou])ying$/i,
			repl: {
				infinitive: "$1y",
				present: "$1ies",
				past: "$1ied",
				doer: "$1ier"
			},
			examples: 'confessing',
			exceptions: [],
			tense: 'gerund'
		},


		//suffixes that need a trailing e
		//
		{
			reg: /(i.)ing$/i,
			repl: {
				infinitive: "$1e",
				present: "$1es",
				past: "$1ed"
			},
			examples: 'driving',
			exceptions: [],
			tense: 'gerund'
		},

		{ //more that need a trailing e
			reg: /(u[rtcb]|[bdtpkg]l|n[cg]|a[gdkvtc]|[ua]s|[dr]g|yz|o[rlsp]|cre)ing$/i,
			repl: {
				infinitive: "$1e",
				present: "$1es",
				past: "$1ed"
			},
			examples: 'convoluting, compensating, fouling',
			exceptions: [],
			tense: 'gerund'
		},

		{ //trailing e on present only
			reg: /(ch|sh)ing$/i,
			repl: {
				infinitive: "$1",
				present: "$1es",
				past: "$1ed"
			},
			examples: 'searching',
			exceptions: [],
			tense: 'gerund'
		},

		{
			reg: /(..)ing$/i,
			repl: {
				infinitive: "$1",
				present: "$1s",
				past: "$1ed"
			},
			examples: 'walking, fawning, farming, swing',
			exceptions: [],
			tense: 'gerund'
		}
	],

	past: [


		//needs an e just for present
		{
			reg: /(sh|ch)ed$/i,
			repl: {
				infinitive: "$1",
				present: "$1es",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'finished',
			exceptions: [],
			power: 1854,
			tense: 'past'
		},

		//needs an e for both
		{
			reg: /(tl|gl)ed$/i,
			repl: {
				infinitive: "$1e",
				present: "$1es",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'felled, flipped',
			exceptions: [],
			power: 1854,
			tense: 'past'
		},

		// double consonants
		{
			reg: /(ss)ed$/i, //l|p|t|g|s
			repl: {
				infinitive: "$1",
				present: "$1es",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'passed',
			exceptions: [],
			power: 0,
			tense: 'past'
		}, {
			reg: /pped$/i, //l|p|t|g|s
			repl: {
				infinitive: "p",
				present: "ps",
				doer: "pper",
				gerund: "pping"
			},
			examples: 'flipped',
			exceptions: [],
			power: 0,
			tense: 'past'
		}, {
			reg: /tted$/i, //l|p|t|g|s
			repl: {
				infinitive: "t",
				present: "ts",
				doer: "tter",
				gerund: "tting"
			},
			examples: 'batted',
			exceptions: [],
			power: 0,
			tense: 'past'
		}, {
			reg: /gged$/i, //l|p|t|g|s
			repl: {
				infinitive: "g",
				present: "gs",
				doer: "gger",
				gerund: "gging"
			},
			examples: 'batted',
			exceptions: [],
			power: 0,
			tense: 'past'
		},

		//doesnt need an e, ever
		{
			reg: /(h|ion|n[dt]|ai.|[cs]t|pp|all|ss|tt|int|ail|en|oo.|er|k|p|w|our|rt|ght)ed$/i,
			repl: {
				infinitive: "$1",
				present: "$1s",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'outwitted',
			exceptions: [],
			power: 1854,
			tense: 'past'
		},

		//needs an e
		{
			reg: /(..[^aeiou])ed$/i,
			repl: {
				infinitive: "$1e",
				present: "$1es",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'convoluted, angulated',
			exceptions: [],
			power: 1854,
			tense: 'past'
		},


		{
			reg: /ied$/i,
			repl: {
				infinitive: "y",
				present: "ies",
				doer: "ier",
				gerund: "ying"
			},
			examples: 'ballyhooed,',
			exceptions: [],
			power: 0,
			tense: 'past'
		}, {
			reg: /(.o)ed$/i,
			repl: {
				infinitive: "$1o",
				present: "$1os",
				doer: "$1oer",
				gerund: "$1oing"
			},
			examples: 'ballyhooed,',
			exceptions: [],
			power: 0,
			tense: 'past'
		},

		{
			reg: /(.i)ed$/i,
			repl: {
				infinitive: "$1",
				present: "$1s",
				doer: "$1er",
				gerund: "$1ing"
			},
			examples: 'ballyhooed,',
			exceptions: [],
			power: 0,
			tense: 'past'
		}, {
			reg: /([rl])ew$/i,
			repl: {
				infinitive: "$1ow",
				present: "$1ows",
				gerund: "$1owing"
			},
			example: "overthrew",
			exceptions: ["brew", "drew", "withdrew", "crew", "screw", "unscrew"],
			tense: "past"
		}, {
			reg: /([pl])t$/i,
			repl: {
				infinitive: "$1",
				present: "$1s",
				gerund: "$1ing"
			},
			example: "lept, leant",
			exceptions: [],
			tense: "past"
		},
	]
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = verb_rules;
}
var verb_irregulars = (function() {
	var main = [{
			"present": "arises",
			"gerund": "arising",
			"past": "arose",
			"infinitive": "arise",
			"participle": "arisen",
			"doer": "ariser"
		}, {
			"infinitive": "babysit",
			"present": "babysits",
			"past": "babysat",
			"gerund": "babysitting",
			"participle": "babysat",
			"doer": "babysitter"
		}, {
			"infinitive": "be",
			"present": "is",
			"gerund": "being",
			"past": "was",
			"participle": "been",
			"doer": "ber"
		}, {
			"infinitive": "beat",
			"present": "beats",
			"past": "beat",
			"gerund": "beating",
			"participle": "beaten",
			"doer": "beater"
		}, {
			"present": "becomes",
			"gerund": "becoming",
			"past": "became",
			"infinitive": "become",
			"participle": "become",
			"doer": "becomer"
		}, {
			"present": "bends",
			"gerund": "bending",
			"past": "bent",
			"infinitive": "bend",
			"participle": "bent",
			"doer": "bender"
		}, {
			"infinitive": "begin",
			"present": "begins",
			"past": "began",
			"gerund": "beginning",
			"participle": "begun",
			"doer": "beginner"
		}, {
			"infinitive": "bet",
			"present": "bets",
			"past": "bet",
			"gerund": "betting",
			"participle": "bet",
			"doer": "better"
		}, {
			"infinitive": "bind",
			"present": "binds",
			"past": "bound",
			"gerund": "binding",
			"participle": "bound",
			"doer": "binder"
		}, {
			"present": "bites",
			"gerund": "biting",
			"past": "bit",
			"infinitive": "bite",
			"participle": "bitten",
			"doer": "biter"
		}, {
			"infinitive": "bleed",
			"present": "bleeds",
			"past": "bled",
			"gerund": "bleeding",
			"participle": "bled",
			"doer": "bleeder"
		}, {
			"infinitive": "blow",
			"present": "blows",
			"past": "blew",
			"gerund": "blowing",
			"participle": "blown",
			"doer": "blower"
		}, {
			"infinitive": "break",
			"present": "breaks",
			"past": "broke",
			"gerund": "breaking",
			"participle": "broken",
			"doer": "breaker"
		}, {
			"infinitive": "breed",
			"present": "breeds",
			"past": "bred",
			"gerund": "breeding",
			"participle": "bred",
			"doer": "breeder"
		}, {
			"infinitive": "bring",
			"present": "brings",
			"past": "brought",
			"gerund": "bringing",
			"participle": "brought",
			"doer": "bringer"
		}, {
			"infinitive": "broadcast",
			"present": "broadcasts",
			"past": "broadcast",
			"gerund": "broadcasting",
			"participle": "broadcast",
			"doer": "broadcaster"
		}, {
			"infinitive": "build",
			"present": "builds",
			"past": "built",
			"gerund": "building",
			"participle": "built",
			"doer": "builder"
		}, {
			"infinitive": "buy",
			"present": "buys",
			"past": "bought",
			"gerund": "buying",
			"participle": "bought",
			"doer": "buyer"
		}, {
			"present": "catches",
			"gerund": "catching",
			"past": "caught",
			"infinitive": "catch",
			"participle": "caught",
			"doer": "catcher"
		}, {
			"infinitive": "choose",
			"present": "chooses",
			"past": "chose",
			"gerund": "choosing",
			"participle": "chosen",
			"doer": "chooser"
		}, {
			"present": "comes",
			"gerund": "coming",
			"past": "came",
			"infinitive": "come",
			"participle": "come",
			"doer": "comer"
		}, {
			"infinitive": "cost",
			"present": "costs",
			"past": "cost",
			"gerund": "costing",
			"participle": "cost",
			"doer": "coster"
		}, {
			"infinitive": "cut",
			"present": "cuts",
			"past": "cut",
			"gerund": "cutting",
			"participle": "cut",
			"doer": "cutter"
		}, {
			"infinitive": "deal",
			"present": "deals",
			"past": "dealt",
			"gerund": "dealing",
			"participle": "dealt",
			"doer": "dealer"
		}, {
			"infinitive": "dig",
			"present": "digs",
			"past": "dug",
			"gerund": "digging",
			"participle": "dug",
			"doer": "digger"
		}, {
			"infinitive": "do",
			"present": "does",
			"past": "did",
			"gerund": "doing",
			"participle": "done",
			"doer": "doer"
		}, {
			"infinitive": "draw",
			"present": "draws",
			"past": "drew",
			"gerund": "drawing",
			"participle": "drawn",
			"doer": "drawer"
		}, {
			"infinitive": "drink",
			"present": "drinks",
			"past": "drank",
			"gerund": "drinking",
			"participle": "drunk",
			"doer": "drinker"
		}, {
			"infinitive": "drive",
			"present": "drives",
			"past": "drove",
			"gerund": "driving",
			"participle": "driven",
			"doer": "driver"
		}, {
			"infinitive": "eat",
			"present": "eats",
			"past": "ate",
			"gerund": "eating",
			"participle": "eaten",
			"doer": "eater"
		}, {
			"infinitive": "fall",
			"present": "falls",
			"past": "fell",
			"gerund": "falling",
			"participle": "fallen",
			"doer": "faller"
		}, {
			"infinitive": "feed",
			"present": "feeds",
			"past": "fed",
			"gerund": "feeding",
			"participle": "fed",
			"doer": "feeder"
		}, {
			"infinitive": "feel",
			"present": "feels",
			"past": "felt",
			"gerund": "feeling",
			"participle": "felt",
			"doer": "feeler"
		}, {
			"infinitive": "fight",
			"present": "fights",
			"past": "fought",
			"gerund": "fighting",
			"participle": "fought",
			"doer": "fighter"
		}, {
			"infinitive": "find",
			"present": "finds",
			"past": "found",
			"gerund": "finding",
			"participle": "found",
			"doer": "finder"
		}, {
			"infinitive": "fly",
			"present": "flys",
			"past": "flew",
			"gerund": "flying",
			"participle": "flown",
			"doer": "flier"
		}, {
			"infinitive": "forbid",
			"present": "forbids",
			"past": "forbade",
			"gerund": "forbiding",
			"participle": "forbidden",
			"doer": null
		}, {
			"infinitive": "forget",
			"present": "forgets",
			"past": "forgot",
			"gerund": "forgeting",
			"participle": "forgotten",
			"doer": "forgeter"
		}, {
			"infinitive": "forgive",
			"present": "forgives",
			"past": "forgave",
			"gerund": "forgiving",
			"participle": "forgiven",
			"doer": "forgiver"
		}, {
			"infinitive": "freeze",
			"present": "freezes",
			"past": "froze",
			"gerund": "freezing",
			"participle": "frozen",
			"doer": "freezer"
		}, {
			"infinitive": "get",
			"present": "gets",
			"past": "got",
			"gerund": "getting",
			"participle": "gotten",
			"doer": "getter"
		}, {
			"infinitive": "give",
			"present": "gives",
			"past": "gave",
			"gerund": "giving",
			"participle": "given",
			"doer": "giver"
		}, {
			"infinitive": "go",
			"present": "goes",
			"gerund": "going",
			"past": "went",
			"participle": "gone",
			"doer": "goer"
		}, {
			"infinitive": "grow",
			"present": "grows",
			"past": "grew",
			"gerund": "growing",
			"participle": "grown",
			"doer": "grower"
		}, {
			"infinitive": "hang",
			"present": "hangs",
			"past": "hung",
			"gerund": "hanging",
			"participle": "hung",
			"doer": "hanger"
		}, {
			"infinitive": "have",
			"present": "has",
			"past": "had",
			"gerund": "having",
			"participle": "had",
			"doer": null
		}, {
			"infinitive": "hear",
			"present": "hears",
			"past": "heard",
			"gerund": "hearing",
			"participle": "heard",
			"doer": "hearer"
		}, {
			"infinitive": "hide",
			"present": "hides",
			"past": "hid",
			"gerund": "hiding",
			"participle": "hidden",
			"doer": "hider"
		}, {
			"infinitive": "hit",
			"present": "hits",
			"past": "hit",
			"gerund": "hitting",
			"participle": "hit",
			"doer": "hitter"
		}, {
			"infinitive": "hold",
			"present": "holds",
			"past": "held",
			"gerund": "holding",
			"participle": "held",
			"doer": "holder"
		}, {
			"infinitive": "hurt",
			"present": "hurts",
			"past": "hurt",
			"gerund": "hurting",
			"participle": "hurt",
			"doer": "hurter"
		}, {
			"infinitive": "know",
			"present": "knows",
			"past": "knew",
			"gerund": "knowing",
			"participle": "known",
			"doer": "knower"
		}, {
			"infinitive": "lay",
			"present": "lays",
			"past": "laid",
			"gerund": "laying",
			"participle": "laid",
			"doer": "layer"
		}, {
			"infinitive": "lead",
			"present": "leads",
			"past": "led",
			"gerund": "leading",
			"participle": "led",
			"doer": "leader"
		}, {
			"infinitive": "leave",
			"present": "leaves",
			"past": "left",
			"gerund": "leaving",
			"participle": "left",
			"doer": "leaver"
		}, {
			"present": "lends",
			"gerund": "lending",
			"past": "lent",
			"infinitive": "lend",
			"participle": "lent",
			"doer": "lender"
		}, {
			"infinitive": "let",
			"present": "lets",
			"past": "let",
			"gerund": "letting",
			"participle": "let",
			"doer": "letter"
		}, {
			"infinitive": "lie",
			"present": "lies",
			"past": "lay",
			"gerund": "lying",
			"participle": "lied",
			"doer": "lier"
		}, {
			"infinitive": "light",
			"present": "lights",
			"past": "lit",
			"gerund": "lighting",
			"participle": "lit",
			"doer": "lighter"
		}, {
			"infinitive": "lose",
			"present": "loses",
			"past": "lost",
			"gerund": "losing",
			"participle": "lost",
			"doer": "loser"
		}, {
			"infinitive": "make",
			"present": "makes",
			"past": "made",
			"gerund": "making",
			"participle": "made",
			"doer": "maker"
		}, {
			"infinitive": "mean",
			"present": "means",
			"past": "meant",
			"gerund": "meaning",
			"participle": "meant",
			"doer": "meaner"
		}, {
			"infinitive": "meet",
			"present": "meets",
			"past": "met",
			"gerund": "meeting",
			"participle": "met",
			"doer": "meeter"
		}, {
			"infinitive": "pay",
			"present": "pays",
			"past": "paid",
			"gerund": "paying",
			"participle": "paid",
			"doer": "payer"
		}, {
			"infinitive": "put",
			"present": "puts",
			"past": "put",
			"gerund": "putting",
			"participle": "put",
			"doer": "putter"
		}, {
			"infinitive": "quit",
			"present": "quits",
			"past": "quit",
			"gerund": "quitting",
			"participle": "quit",
			"doer": "quitter"
		}, {
			"infinitive": "read",
			"present": "reads",
			"past": "read",
			"gerund": "reading",
			"participle": "read",
			"doer": "reader"
		}, {
			"infinitive": "ride",
			"present": "rides",
			"past": "rode",
			"gerund": "riding",
			"participle": "ridden",
			"doer": "rider"
		}, {
			"infinitive": "ring",
			"present": "rings",
			"past": "rang",
			"gerund": "ringing",
			"participle": "rung",
			"doer": "ringer"
		}, {
			"present": "rises",
			"gerund": "rising",
			"past": "rose",
			"infinitive": "rise",
			"participle": "risen",
			"doer": "riser"
		}, {
			"infinitive": "run",
			"present": "runs",
			"past": "ran",
			"gerund": "running",
			"participle": "run",
			"doer": "runner"
		}, {
			"infinitive": "say",
			"present": "says",
			"past": "said",
			"gerund": "saying",
			"participle": "said",
			"doer": null
		}, {
			"infinitive": "see",
			"present": "sees",
			"past": "saw",
			"gerund": "seeing",
			"participle": "seen",
			"doer": "seer"
		}, {
			"infinitive": "sell",
			"present": "sells",
			"past": "sold",
			"gerund": "selling",
			"participle": "sold",
			"doer": "seller"
		}, {
			"present": "sends",
			"gerund": "sending",
			"past": "sent",
			"infinitive": "send",
			"participle": "sent",
			"doer": "sender"
		}, {
			"infinitive": "set",
			"present": "sets",
			"past": "set",
			"gerund": "setting",
			"participle": "set",
			"doer": "setter"
		}, {
			"infinitive": "shake",
			"present": "shakes",
			"past": "shook",
			"gerund": "shaking",
			"participle": "shaken",
			"doer": "shaker"
		}, {
			"infinitive": "shine",
			"present": "shines",
			"past": "shone",
			"gerund": "shining",
			"participle": "shone",
			"doer": "shiner"
		}, {
			"infinitive": "shoot",
			"present": "shoots",
			"past": "shot",
			"gerund": "shooting",
			"participle": "shot",
			"doer": "shooter"
		}, {
			"infinitive": "show",
			"present": "shows",
			"past": "showed",
			"gerund": "showing",
			"participle": "shown",
			"doer": "shower"
		}, {
			"infinitive": "shut",
			"present": "shuts",
			"past": "shut",
			"gerund": "shutting",
			"participle": "shut",
			"doer": "shutter"
		}, {
			"infinitive": "sing",
			"present": "sings",
			"past": "sang",
			"gerund": "singing",
			"participle": "sung",
			"doer": "singer"
		}, {
			"infinitive": "sink",
			"present": "sinks",
			"past": "sank",
			"gerund": "sinking",
			"participle": "sunk",
			"doer": "sinker"
		}, {
			"infinitive": "sit",
			"present": "sits",
			"past": "sat",
			"gerund": "sitting",
			"participle": "sat",
			"doer": "sitter"
		}, {
			"infinitive": "slide",
			"present": "slides",
			"past": "slid",
			"gerund": "sliding",
			"participle": "slid",
			"doer": "slider"
		}, {
			"infinitive": "speak",
			"present": "speaks",
			"past": "spoke",
			"gerund": "speaking",
			"participle": "spoken",
			"doer": "speaker"
		}, {
			"present": "spends",
			"gerund": "spending",
			"past": "spent",
			"infinitive": "spend",
			"participle": "spent",
			"doer": "spender"
		}, {
			"infinitive": "spin",
			"present": "spins",
			"past": "spun",
			"gerund": "spinning",
			"participle": "spun",
			"doer": "spinner"
		}, {
			"infinitive": "spread",
			"present": "spreads",
			"past": "spread",
			"gerund": "spreading",
			"participle": "spread",
			"doer": "spreader"
		}, {
			"infinitive": "stand",
			"present": "stands",
			"past": "stood",
			"gerund": "standing",
			"participle": "stood",
			"doer": "stander"
		}, {
			"infinitive": "steal",
			"present": "steals",
			"past": "stole",
			"gerund": "stealing",
			"participle": "stolen",
			"doer": "stealer"
		}, {
			"infinitive": "stick",
			"present": "sticks",
			"past": "stuck",
			"gerund": "sticking",
			"participle": "stuck",
			"doer": "sticker"
		}, {
			"infinitive": "sting",
			"present": "stings",
			"past": "stung",
			"gerund": "stinging",
			"participle": "stung",
			"doer": "stinger"
		}, {
			"infinitive": "strike",
			"present": "strikes",
			"past": "struck",
			"gerund": "striking",
			"participle": "struck",
			"doer": "striker"
		}, {
			"infinitive": "swear",
			"present": "swears",
			"past": "swore",
			"gerund": "swearing",
			"participle": "sworn",
			"doer": "swearer"
		}, {
			"infinitive": "swim",
			"present": "swims",
			"past": "swam",
			"gerund": "swiming",
			"participle": "swum",
			"doer": "swimmer"
		}, {
			"infinitive": "swing",
			"present": "swings",
			"past": "swung",
			"gerund": "swinging",
			"participle": "swung",
			"doer": "swinger"
		}, {
			"infinitive": "take",
			"present": "takes",
			"past": "took",
			"gerund": "taking",
			"participle": "taken",
			"doer": "taker"
		}, {
			"infinitive": "teach",
			"present": "teachs",
			"past": "taught",
			"gerund": "teaching",
			"participle": "taught",
			"doer": "teacher"
		}, {
			"infinitive": "tear",
			"present": "tears",
			"past": "tore",
			"gerund": "tearing",
			"participle": "torn",
			"doer": "tearer"
		}, {
			"infinitive": "tell",
			"present": "tells",
			"past": "told",
			"gerund": "telling",
			"participle": "told",
			"doer": "teller"
		}, {
			"infinitive": "think",
			"present": "thinks",
			"past": "thought",
			"gerund": "thinking",
			"participle": "thought",
			"doer": "thinker"
		}, {
			"infinitive": "throw",
			"present": "throws",
			"past": "threw",
			"gerund": "throwing",
			"participle": "thrown",
			"doer": "thrower"
		}, {
			"infinitive": "understand",
			"present": "understands",
			"past": "understood",
			"gerund": "understanding",
			"participle": "understood",
			"doer": null
		}, {
			"infinitive": "wake",
			"present": "wakes",
			"past": "woke",
			"gerund": "waking",
			"participle": "woken",
			"doer": "waker"
		}, {
			"infinitive": "wear",
			"present": "wears",
			"past": "wore",
			"gerund": "wearing",
			"participle": "worn",
			"doer": "wearer"
		}, {
			"present": "wins",
			"gerund": "winning",
			"past": "won",
			"infinitive": "win",
			"participle": "won",
			"doer": "winner"
		}, {
			"infinitive": "withdraw",
			"present": "withdraws",
			"past": "withdrew",
			"gerund": "withdrawing",
			"participle": "withdrawn",
			"doer": "withdrawer"
		}, {
			"present": "writes",
			"gerund": "writing",
			"past": "wrote",
			"infinitive": "write",
			"participle": "written",
			"doer": "writer"
		}, {
			"infinitive": "tie",
			"present": "ties",
			"past": "tied",
			"gerund": "tying",
			"doer": "tier"
		}, {
			"infinitive": "obey",
			"present": "obeys",
			"past": "obeyed",
			"gerund": "obeying",
			"doer": "obeyer"
		}, {
			"infinitive": "ski",
			"present": "skis",
			"past": "skiied",
			"gerund": "skiing",
			"doer": "skier"
		}, {
			"infinitive": "boil",
			"present": "boils",
			"past": "boiled",
			"gerund": "boiling",
			"doer": "boiler"
		}, {
			"infinitive": "feed",
			"present": "feeds",
			"past": "fed",
			"gerund": "feeding",
			"doer": "feeder"
		},
    {
			"infinitive": "miss",
			"present": "miss",
			"past": "missed",
			"gerund": "missing",
			"doer": "misser"
		},
    {
			"infinitive": "act",
			"present": "acts",
			"past": "acted",
			"gerund": "acting",
			"doer": "actor"
		},
		{ present: 'competes',
		  gerund: 'competing',
		  past: 'competed',
		  infinitive: 'compete',
		  doer: 'competitor' },

		{ present: 'are',
		  gerund: 'are',
		  past: 'were',
		  infinitive: 'being',
		  doer: '' },

	  { infinitive: 'imply',
		  present: 'implies',
		  past: 'implied',
		  gerund: 'implying',
		  doer: 'implier' },

	]


	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();
//somone who does this present-tense verb
//turn 'walk' into 'walker'
var verb_to_doer = (function() {
	var main = function(str) {
		str = str || ''

		var irregulars = {
			"tie": "tier",
			"dream": "dreamer",
			"sail": "sailer",
			"run": "runner",
			rub: "rubber",
			begin: "beginner",
			win: "winner",
			claim: "claimant",
			deal: "dealer",
			spin: "spinner",
		}
		var dont = {
			"aid": 1,
			"fail": 1,
			"appear": 1,
			"happen": 1,
			"seem": 1,
			"try": 1,
			"say": 1,
			"marry": 1,
			"be": 1,
			"forbid": 1,
			"understand": 1,
		}
		var transforms = [{
			reg: /e$/i,
			repl: 'er',
		}, {
			reg: /([aeiou])([mlgp])$/i,
			repl: '$1$2$2er',
		}, {
			reg: /([rl])y$/i,
			repl: '$1ier',
		}, {
			reg: /^(.?.[aeiou])t$/i,
			repl: '$1tter',
		}, ]

		if (dont[str]) {
			return null
		}

		if (irregulars[str]) {
			return irregulars[str]
		}

		for (var i = 0; i < transforms.length; i++) {
			if (str.match(transforms[i].reg)) {
				return str.replace(transforms[i].reg, transforms[i].repl)
			}
		}

		return str + "er"
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();



// console.log(verb_to_doer('set'))
// console.log(verb_to_doer('sweep'))
// console.log(verb_to_doer('aid'))
// console.log(verb_to_doer('apply'))
var verb_conjugate = (function() {

  if (typeof module !== "undefined" && module.exports) {
    verb_to_doer = require("./to_doer")
    verb_irregulars = require("./verb_irregulars")
    verb_rules = require("./verb_rules")
  }

  var predict = function(w) {
    //generated from test data
    var suffix_rules = {
      "ing": "gerund",
      "tes": "present",
      "ate": "infinitive",
      "zes": "present",
      "ize": "infinitive",
      "ers": "present",
      "les": "present",
      "es": "present",
      "ts": "present",
      "ns": "present",
      "er": "infinitive",
      "le": "infinitive",
      "acks": "present",
      "ends": "present",
      "ands": "present",
      "ocks": "present",
      "tion": "infinitive",
      "lays": "present",
      "rify": "infinitive",
      "eads": "present",
      "ress": "infinitive",
      "lls": "present",
      "els": "present",
      "ify": "infinitive",
      "age": "infinitive",
      "ils": "present",
      "ows": "present",
      "nce": "infinitive",
      "ect": "infinitive",
      "nds": "present",
      "ise": "infinitive",
      "ine": "infinitive",
      "nks": "present",
      "ish": "infinitive",
      "ace": "infinitive",
      "cks": "present",
      "ash": "infinitive",
      "ure": "infinitive",
      "tch": "infinitive",
      "ngs": "present",
      "end": "infinitive",
      "ack": "infinitive",
      "mps": "present",
      "ays": "present",
      "and": "infinitive",
      "ute": "infinitive",
      "ade": "infinitive",
      "ock": "infinitive",
      "ite": "infinitive",
      "rks": "present",
      "ase": "infinitive",
      "ose": "infinitive",
      "use": "infinitive",
      "ams": "present",
      "ars": "present",
      "ops": "present",
      "ffs": "present",
      "als": "present",
      "ive": "infinitive",
      "int": "infinitive",
      "nge": "infinitive",
      "urs": "present",
      "lds": "present",
      "ews": "present",
      "ips": "present",
      "lay": "infinitive",
      "est": "infinitive",
      "ain": "infinitive",
      "ant": "infinitive",
      "eed": "infinitive",
      "ed": "past",
      "s": "present",
      "lt": "past",
      "nt": "past",
      "pt": "past",
      "ew": "past",
      "ld": "past",
    }

    var endsWith = function(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    var arr = Object.keys(suffix_rules);
    for (var i = 0; i < arr.length; i++) {
      if (endsWith(w, arr[i])) {
        return suffix_rules[arr[i]]
      }
    }
    return "infinitive"
  }


  //fallback to this transformation if it has an unknown prefix
  var fallback = function(w) {
    // console.log('fallback')
    var infinitive = w.replace(/ed$/, '');
    var present, past, gerund, doer;
    if (w.match(/[^aeiou]$/)) {
      gerund = w + "ing"
      past = w + "ed"
      present = w + "s"
      doer = verb_to_doer(infinitive)
    } else {
      gerund = w.replace(/[aeiou]$/, 'ing')
      past = w.replace(/[aeiou]$/, 'ed')
      present = w.replace(/[aeiou]$/, 'es')
      doer = verb_to_doer(infinitive)
    }
    return {
      infinitive: infinitive,
      present: present,
      past: past,
      gerund: gerund,
      doer: doer,
    }
  }

  //make sure object has all forms
  var fufill = function(obj) {
    if (!obj.infinitive) {
      return obj
    }
    if (!obj.gerund) {
      obj.gerund = obj.infinitive + 'ing'
    }
    if (!obj.doer) {
      obj.doer = verb_to_doer(obj.infinitive)
    }
    if (!obj.present) {
      obj.present = obj.infinitive + 's'
    }
    if (!obj.past) {
      obj.past = obj.infinitive + 'ed'
    }
    return obj
  }


  var main = function(w) {
    if (!w) {
      return {}
    }
    var done = {}
    //check irregulars
    for (var i = 0; i < verb_irregulars.length; i++) {
      var x = verb_irregulars[i];
      if (w == x.present || w == x.gerund || w == x.past || w == x.infinitive) {
        return fufill(verb_irregulars[i])
      }
    }
    // console.log(predict(w))
    var predicted = predict(w) || 'infinitive'

    //check against suffix rules
    for (var i = 0; i < verb_rules[predicted].length; i++) {
      var r = verb_rules[predicted][i];
      if (w.match(r.reg)) {
        // console.log(r)
        var obj = Object.keys(r.repl).reduce(function(h, k) {
          if (k == predicted) {
            h[k] = w
          } else {
            h[k] = w.replace(r.reg, r.repl[k]);
          }
          return h;
        }, {});
        obj[r.tense] = w;
        return fufill(obj);
      }
    }

    //produce a generic transformation
    return fallback(w)
  };



  if (typeof module !== "undefined" && module.exports) {
    module.exports = main;
  }
  return main
})()

// console.log(verb_conjugate("swing"))
// console.log(verb_conjugate("walking"))
// console.log(verb_conjugate("win"))
// console.log(verb_conjugate("write"))
// console.log(verb_conjugate("stop"))
// console.log(verb_conjugate("walked"))
// console.log(verb_conjugate("having"))
// console.log(verb_conjugate("attend"))
// console.log(verb_conjugate("forecasts"))
// console.log(verb_conjugate("increased"))
// console.log(verb_conjugate("spoilt"))
// console.log(verb_conjugate("oversold"))
// console.log(verb_conjugate("lynching"))
// console.log(verb_conjugate("marooning"))
// console.log(verb_conjugate("immoblizing"))
// console.log(verb_conjugate("immobilize"))
// console.log(verb_conjugate("rushing"))
// console.log(verb_conjugate("timing"))
// console.log(verb_conjugate("produces"))
// console.log(verb_conjugate("boiling"))
// console.log(verb_conjugate("mortified"))
// console.log(verb_conjugate("located"))
// console.log(verb_conjugate("timed"))
// console.log(verb_conjugate("flipped"))
// console.log(verb_conjugate("fitted"))
// console.log(verb_conjugate("passed"))
// console.log(verb_conjugate("wrangled"))
// console.log(verb_conjugate("twisted"))
// console.log(verb_conjugate("walled"))
// console.log(verb_conjugate("finished"))
// console.log(verb_conjugate("wiggled"))
// console.log(verb_conjugate("confessed"))
// console.log(verb_conjugate("called"))
// console.log(verb_conjugate("whipped"))
// console.log(verb_conjugate("batted"))
// console.log(verb_conjugate("chugged"))
// console.log(verb_conjugate("flopped"))

// console.log(verb_conjugate("clipping"))
// console.log(verb_conjugate("searching"))
// console.log(verb_conjugate("confessing"))
// console.log(verb_conjugate("satisfying"))
// console.log(verb_conjugate("write"))
// console.log(verb_conjugate("see"))
// console.log(verb_conjugate("consider"))
// console.log(verb_conjugate("weep"))
// console.log(verb_conjugate("imply"))
// console.log(verb_conjugate("count"))
// console.log(verb_conjugate("seed"))//
// console.log(verb_conjugate("plead"))


// console.log(verb_conjugate("contain")) ///*****bug
// console.log(verb_conjugate("stain"))//****bug
// console.log(verb_conjugate("glean"))//****bug


// console.log(verb_conjugate("result")) //****bug
// console.log(verb_conjugate("develop")) //****bug
// console.log(verb_conjugate("wait"))//****bug
// console.log(verb_conjugate("pass"))//****bug
// console.log(verb_conjugate("answer"))//****bug


var Verb = function(str, next, last, token) {
	var the = this
	the.word = str || '';
	the.next = next
	the.last = last

	if (typeof module !== "undefined" && module.exports) {
		verb_conjugate = require("./conjugate/conjugate")
		parts_of_speech = require("../../data/parts_of_speech")
	}

	var copulas = {
		"is": "CP",
		"will be": "CP",
		"will": "CP",
		"are": "CP",
		"was": "CP",
		"were": "CP",
	}
	var modals = {
		"can": "MD",
		"may": "MD",
		"could": "MD",
		"might": "MD",
		"will": "MD",
		"ought to": "MD",
		"would": "MD",
		"must": "MD",
		"shall": "MD",
		"should": "MD",
	}
	var tenses = {
		past: "VBD",
		participle: "VBN",
		infinitive: "VBP",
		present: "VBZ",
		gerund: "VBG"
	}

	the.conjugate = function() {
		return verb_conjugate(the.word)
	}

	the.to_past = function() {
		if (the.form == "gerund") {
			return the.word
		}
		return verb_conjugate(the.word).past
	}
	the.to_present = function() {
		return verb_conjugate(the.word).present
	}
	the.to_future = function() {
		return "will " + verb_conjugate(the.word).infinitive
	}

	//which conjugation
	the.form = (function() {
		var forms = verb_conjugate(the.word)
		for (var i in forms) {
			if (forms[i] == the.word) {
				return i
			}
		}
	})()

	//past/present/future
	the.tense = (function() {
		if (the.word.match(/^will ./)) {
			return "future"
		}
		var form = the.form
		if (form == "present") {
			return "present"
		}
		if (form == "past") {
			return "past"
		}
		return "present"
	})()

	//the most accurate part_of_speech
	the.which = (function() {
		if (copulas[the.word]) {
			return parts_of_speech['CP']
		}
		if (the.word.match(/([aeiou][^aeiouwyrlm])ing$/)) {
			return parts_of_speech['VBG']
		}
		var form = the.form
		return parts_of_speech[tenses[form]]
	})()

	//is this verb negative already?
	the.negative = (function() {
		if (the.word.match(/n't$/)) {
			return true
		}
		if ((modals[the.word] || copulas[the.word]) && the.next && the.next.normalised == "not") {
			return true
		}
		return false
	})()


	return the;
}
if (typeof module !== "undefined" && module.exports) {
	module.exports = Verb;
}


// console.log(new Verb("walked"))
// console.log(new Verb("stalking").tense)
// console.log(new Verb("will walk").tense)
// console.log(new Verb("stalks"))
// console.log(new Verb("eat").to_future())
// console.log(new Verb("having").to_past())
//convert cute to cuteness
var adj_to_noun = (function() {

    var main = function(w) {

        var irregulars;
        irregulars = {
            "clean": "cleanliness",
            "naivety": "naivety"
        };
        if (!w) {
            return "";
        }
        if (irregulars[w]) {
            return irregulars[w];
        }
        if (w.match(" ")) {
            return w;
        }
        if (w.match(/w$/)) {
            return w;
        }
        if (w.match(/y$/)) {
            return w.replace(/y$/, 'iness');
        }
        if (w.match(/le$/)) {
            return w.replace(/le$/, 'ility');
        }
        if (w.match(/ial$/)) {
            return w.replace(/ial$/, 'y');
        }
        if (w.match(/al$/)) {
            return w.replace(/al$/, 'ality');
        }
        if (w.match(/ting$/)) {
            return w.replace(/ting$/, 'ting');
        }
        if (w.match(/ring$/)) {
            return w.replace(/ring$/, 'ring');
        }
        if (w.match(/bing$/)) {
            return w.replace(/bing$/, 'bingness');
        }
        if (w.match(/ning$/)) {
            return w.replace(/ning$/, 'ningness');
        }
        if (w.match(/sing$/)) {
            return w.replace(/sing$/, 'se');
        }
        if (w.match(/ing$/)) {
            return w.replace(/ing$/, 'ment');
        }
        if (w.match(/ess$/)) {
            return w.replace(/ess$/, 'essness');
        }
        if (w.match(/ous$/)) {
            return w.replace(/ous$/, 'ousness');
        }
        if (w.match(/s$/)) {
            return w;
        }
        return w + "ness";
    };


    if (typeof module !== "undefined" && module.exports) {
        module.exports = main;
    }
    return main
})()

// console.log(exports.adj_to_noun('mysterious'));
//turn 'quick' into 'quickly'
var to_comparative = (function() {
	var main = function(str) {


		var irregulars = {
			"grey": "greyer",
			"gray": "grayer",
			"green": "greener",
			"yellow": "yellower",
			"red": "redder",
			"good": "better",
			"well": "better",
			"bad": "worse",
			"sad": "sadder",
		}
		var dos = {
			"absurd": 1,
			"aggressive": 1,
			"alert": 1,
			"alive": 1,
			"awesome": 1,
			"beautiful": 1,
			"big": 1,
			"bitter": 1,
			"black": 1,
			"blue": 1,
			"bored": 1,
			"boring": 1,
			"brash": 1,
			"brave": 1,
			"brief": 1,
			"bright": 1,
			"broad": 1,
			"brown": 1,
			"calm": 1,
			"charming": 1,
			"cheap": 1,
			"clean": 1,
			"cold": 1,
			"cool": 1,
			"cruel": 1,
			"cute": 1,
			"damp": 1,
			"deep": 1,
			"dear": 1,
			"dead": 1,
			"dark": 1,
			"dirty": 1,
			"drunk": 1,
			"dull": 1,
			"eager": 1,
			"efficient": 1,
			"even": 1,
			"faint": 1,
			"fair": 1,
			"fanc": 1,
			"fast": 1,
			"fat": 1,
			"feeble": 1,
			"few": 1,
			"fierce ": 1,
			"fine": 1,
			"flat": 1,
			"forgetful": 1,
			"frail": 1,
			"full": 1,
			"gentle": 1,
			"glib": 1,
			"great": 1,
			"green": 1,
			"gruesome": 1,
			"handsome": 1,
			"hard": 1,
			"harsh": 1,
			"high": 1,
			"hollow": 1,
			"hot": 1,
			"impolite": 1,
			"innocent": 1,
			"keen": 1,
			"kind": 1,
			"lame": 1,
			"lean": 1,
			"light": 1,
			"little": 1,
			"loose": 1,
			"long": 1,
			"loud": 1,
			"low": 1,
			"lush": 1,
			"macho": 1,
			"mean": 1,
			"meek": 1,
			"mellow": 1,
			"mundane": 1,
			"near": 1,
			"neat": 1,
			"new": 1,
			"nice": 1,
			"normal": 1,
			"odd": 1,
			"old": 1,
			"pale": 1,
			"pink": 1,
			"plain": 1,
			"poor": 1,
			"proud": 1,
			"purple": 1,
			"quick": 1,
			"rare": 1,
			"rapid": 1,
			"red": 1,
			"rich": 1,
			"ripe": 1,
			"rotten": 1,
			"round": 1,
			"rude": 1,
			"sad": 1,
			"safe": 1,
			"scarce": 1,
			"scared": 1,
			"shallow": 1,
			"sharp": 1,
			"short": 1,
			"shrill": 1,
			"simple": 1,
			"slim": 1,
			"slow": 1,
			"small": 1,
			"smart": 1,
			"smooth": 1,
			"soft": 1,
			"sore": 1,
			"sour": 1,
			"square": 1,
			"stale": 1,
			"steep": 1,
			"stiff": 1,
			"straight": 1,
			"strange": 1,
			"strong": 1,
			"sweet": 1,
			"swift": 1,
			"tall": 1,
			"tame": 1,
			"tart": 1,
			"tender": 1,
			"tense": 1,
			"thick": 1,
			"thin": 1,
			"tight": 1,
			"tough": 1,
			"vague": 1,
			"vast": 1,
			"vulgar": 1,
			"warm": 1,
			"weak": 1,
			"wet": 1,
			"white": 1,
			"wide": 1,
			"wild": 1,
			"wise": 1,
			"young": 1,
			"yellow": 1,
			"easy": 1,
			"narrow": 1,
			"late": 1,
			"early": 1,
			"soon": 1,
			"close": 1,
			"empty": 1,
			"dry": 1,
			"windy": 1,
			"noisy": 1,
			"thirsty": 1,
			"hungry": 1,
			"fresh": 1,
			"quiet": 1,
			"clear": 1,
			"heavy": 1,
			"happy": 1,
			"funny": 1,
			"lucky": 1,
			"pretty": 1,
			"important": 1,
			"interesting": 1,
			"attractive": 1,
			"dangerous": 1,
			"intellegent": 1,
			"pure": 1,
			"orange": 1,
			"large": 1,
			"firm": 1,
			"grand": 1,
			"formal": 1,
			"raw": 1,
			"weird": 1,
			"glad": 1,
			"mad": 1,
			"strict": 1,
			"tired": 1,
			"solid": 1,
			"extreme": 1,
			"mature": 1,
			"true": 1,
			"free": 1,
			"curly": 1,
			"angry": 1
		}

		var dont = {
			"overweight": 1,
			"main": 1,
			"nearby": 1,
			"asleep": 1,
			"weekly": 1,
			"secret": 1,
			"certain": 1,
		}
		var transforms = [{
			reg: /y$/i,
			repl: 'ier',
		}, {
			reg: /([aeiou])t$/i,
			repl: '$1tter',
		}, {
			reg: /([aeou])de$/i,
			repl: '$1der',
		}, {
			reg: /nge$/i,
			repl: 'nger',
		}, ]
		var matches = [
			/ght$/,
			/nge$/,
			/ough$/,
			/ain$/,
			/uel$/,
			/[au]ll$/,
			/ow$/,
			/old$/,
			/oud$/,
			/e[ae]p$/,
		]
		var not_matches = [
			/ary$/,
			/ous$/,
		]

		if (dont[str]) {
			return null
		}
		if (dos[str]) {
			if (str.match(/e$/)) {
				return str + "r"
			} else {
				return str + "er"
			}
		}
		if (irregulars[str]) {
			return irregulars[str]
		}

		for (var i = 0; i < not_matches.length; i++) {
			if (str.match(not_matches[i])) {
				return "more " + str
			}
		}

		for (var i = 0; i < transforms.length; i++) {
			if (str.match(transforms[i].reg)) {
				return str.replace(transforms[i].reg, transforms[i].repl)
			}
		}
		for (var i = 0; i < matches.length; i++) {
			if (str.match(matches[i])) {
				return str + "er"
			}
		}
		return "more " + str
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();



// console.log(to_comparative('dry'))
// console.log(to_comparative('cruel'))
// console.log(to_comparative('hot'))
// console.log(to_comparative('wide'))
// console.log(to_comparative('strange'))
// console.log(to_comparative('narrow'))
// console.log(to_comparative('dull'))
// console.log(to_comparative('weak'))
// console.log(to_comparative('sad'))

//turn 'quick' into 'quickest'
var to_superlative = (function() {
	var main = function(str) {


		var irregulars = {
			"nice": "nicest",
			"late": "latest",
			"hard": "hardest",
			"inner": "innermost",
			"outer": "outermost",
			"far": "furthest",
			"worse": "worst",
			"bad": "worst",
			"good": "best",
		}
		var dos = {
			"absurd": 1,
			"aggressive": 1,
			"alert": 1,
			"alive": 1,
			"awesome": 1,
			"beautiful": 1,
			"big": 1,
			"bitter": 1,
			"black": 1,
			"blue": 1,
			"bored": 1,
			"boring": 1,
			"brash": 1,
			"brave": 1,
			"brief": 1,
			"bright": 1,
			"broad": 1,
			"brown": 1,
			"calm": 1,
			"charming": 1,
			"cheap": 1,
			"clean": 1,
			"cold": 1,
			"cool": 1,
			"cruel": 1,
			"cute": 1,
			"damp": 1,
			"deep": 1,
			"dear": 1,
			"dead": 1,
			"dark": 1,
			"dirty": 1,
			"drunk": 1,
			"dull": 1,
			"eager": 1,
			"efficient": 1,
			"even": 1,
			"faint": 1,
			"fair": 1,
			"fanc": 1,
			"fast": 1,
			"fat": 1,
			"feeble": 1,
			"few": 1,
			"fierce ": 1,
			"fine": 1,
			"flat": 1,
			"forgetful": 1,
			"frail": 1,
			"full": 1,
			"gentle": 1,
			"glib": 1,
			"great": 1,
			"green": 1,
			"gruesome": 1,
			"handsome": 1,
			"hard": 1,
			"harsh": 1,
			"high": 1,
			"hollow": 1,
			"hot": 1,
			"impolite": 1,
			"innocent": 1,
			"keen": 1,
			"kind": 1,
			"lame": 1,
			"lean": 1,
			"light": 1,
			"little": 1,
			"loose": 1,
			"long": 1,
			"loud": 1,
			"low": 1,
			"lush": 1,
			"macho": 1,
			"mean": 1,
			"meek": 1,
			"mellow": 1,
			"mundane": 1,
			"near": 1,
			"neat": 1,
			"new": 1,
			"nice": 1,
			"normal": 1,
			"odd": 1,
			"old": 1,
			"pale": 1,
			"pink": 1,
			"plain": 1,
			"poor": 1,
			"proud": 1,
			"purple": 1,
			"quick": 1,
			"rare": 1,
			"rapid": 1,
			"red": 1,
			"rich": 1,
			"ripe": 1,
			"rotten": 1,
			"round": 1,
			"rude": 1,
			"sad": 1,
			"safe": 1,
			"scarce": 1,
			"scared": 1,
			"shallow": 1,
			"sharp": 1,
			"short": 1,
			"shrill": 1,
			"simple": 1,
			"slim": 1,
			"slow": 1,
			"small": 1,
			"smart": 1,
			"smooth": 1,
			"soft": 1,
			"sore": 1,
			"sour": 1,
			"square": 1,
			"stale": 1,
			"steep": 1,
			"stiff": 1,
			"straight": 1,
			"strange": 1,
			"strong": 1,
			"sweet": 1,
			"swift": 1,
			"tall": 1,
			"tame": 1,
			"tart": 1,
			"tender": 1,
			"tense": 1,
			"thick": 1,
			"thin": 1,
			"tight": 1,
			"tough": 1,
			"vague": 1,
			"vast": 1,
			"vulgar": 1,
			"warm": 1,
			"weak": 1,
			"wet": 1,
			"white": 1,
			"wide": 1,
			"wild": 1,
			"wise": 1,
			"young": 1,
			"yellow": 1,
			"easy": 1,
			"narrow": 1,
			"late": 1,
			"early": 1,
			"soon": 1,
			"close": 1,
			"empty": 1,
			"dry": 1,
			"windy": 1,
			"noisy": 1,
			"thirsty": 1,
			"hungry": 1,
			"fresh": 1,
			"quiet": 1,
			"clear": 1,
			"heavy": 1,
			"happy": 1,
			"funny": 1,
			"lucky": 1,
			"pretty": 1,
			"important": 1,
			"interesting": 1,
			"attractive": 1,
			"dangerous": 1,
			"intellegent": 1,
			"pure": 1,
			"orange": 1,
			"large": 1,
			"firm": 1,
			"grand": 1,
			"formal": 1,
			"raw": 1,
			"weird": 1,
			"glad": 1,
			"mad": 1,
			"strict": 1,
			"tired": 1,
			"solid": 1,
			"extreme": 1,
			"mature": 1,
			"true": 1,
			"free": 1,
			"curly": 1,
			"angry": 1
		}

		var dont = {
			"overweight": 1,
			"ready": 1,
		}
		var transforms = [{
			reg: /y$/i,
			repl: 'iest',
		}, {
			reg: /([aeiou])t$/i,
			repl: '$1ttest',
		}, {
			reg: /([aeou])de$/i,
			repl: '$1dest',
		}, {
			reg: /nge$/i,
			repl: 'ngest',
		}, ]
		var matches = [
			/ght$/,
			/nge$/,
			/ough$/,
			/ain$/,
			/uel$/,
			/[au]ll$/,
			/ow$/,
			/oud$/,
			/...p$/,
		]
		var not_matches = [
			/ary$/
		]

		var generic_transformation = function(str) {
			if (str.match(/e$/)) {
				return str + "st"
			} else {
				return str + "est"
			}
		}

		if (dos[str]) {
			return generic_transformation(str)
		}
		if (dont[str]) {
			return "most " + str
		}
		if (irregulars[str]) {
			return irregulars[str]
		}

		for (var i = 0; i < not_matches.length; i++) {
			if (str.match(not_matches[i])) {
				return "most " + str
			}
		}

		for (var i = 0; i < transforms.length; i++) {
			if (str.match(transforms[i].reg)) {
				return str.replace(transforms[i].reg, transforms[i].repl)
			}
		}
		for (var i = 0; i < matches.length; i++) {
			if (str.match(matches[i])) {
				return generic_transformation(str)
			}
		}
		return "most " + str
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();



// console.log(to_superlative('dry'))
// console.log(to_superlative('rich'))
//turn 'quick' into 'quickly'
var adj_to_adv = (function() {
	var main = function(str) {


		var irregulars = {
			"idle": "idly",
			"public": "publicly",
			"vague": "vaguely",
			"day": "daily",
			"icy": "icily",
			"single": "singly",
			"female": "womanly",
			"male": "manly",
			"simple": "simply",
			"whole": "wholly",
			"special": "especially",
			"straight": "straight",
			"wrong": "wrong",
			"fast": "fast",
			"hard": "hard",
			"late": "late",
			"early": "early",
			"well": "well",
			"best": "best",
			"latter": "latter",
			"bad": "badly",
		}
		var dont = {
			"foreign": 1,
			"black": 1,
			"modern": 1,
			"next": 1,
			"difficult": 1,
			"degenerate": 1,
			"young": 1,
			"awake": 1,
			"back": 1,
			"blue": 1,
			"brown": 1,
			"orange": 1,
			"complex": 1,
			"cool": 1,
			"dirty": 1,
			"done": 1,
			"empty": 1,
			"fat": 1,
			"fertile": 1,
			"frozen": 1,
			"gold": 1,
			"grey": 1,
			"gray": 1,
			"green": 1,
			"medium": 1,
			"parallel": 1,
			"outdoor": 1,
			"unknown": 1,
			"undersized": 1,
			"used": 1,
			"welcome": 1,
			"yellow": 1,
			"white": 1,
			"fixed": 1,
			"mixed": 1,
			"super": 1,
			"guilty": 1,
			"tiny": 1,
			"able": 1,
			"unable": 1,
			"same": 1,
			"adult": 1,
		}
		var transforms = [{
			reg: /al$/i,
			repl: 'ally',
		}, {
			reg: /ly$/i,
			repl: 'ly',
		}, {
			reg: /(.{3})y$/i,
			repl: '$1ily',
		}, {
			reg: /que$/i,
			repl: 'quely',
		}, {
			reg: /ue$/i,
			repl: 'uly',
		}, {
			reg: /ic$/i,
			repl: 'ically',
		}, {
			reg: /ble$/i,
			repl: 'bly',
		}, {
			reg: /l$/i,
			repl: 'ly',
		}, ]

		var not_matches = [
			/airs$/,
			/ll$/,
			/ee.$/,
			/ile$/,
		]

		if (dont[str]) {
			return null
		}
		if (irregulars[str]) {
			return irregulars[str]
		}
		if (str.length <= 3) {
			return null
		}
		for (var i = 0; i < not_matches.length; i++) {
			if (str.match(not_matches[i])) {
				return null
			}
		}
		for (var i = 0; i < transforms.length; i++) {
			if (str.match(transforms[i].reg)) {
				return str.replace(transforms[i].reg, transforms[i].repl)
			}
		}
		return str + 'ly'
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main;
})();



// data = require("./test").data
// data = data.filter(function(w) {
// 	return to_adverb(w[1]) != w[0]
// })
// arr = data.map(function(w) {
// 	console.log(w[1] + "  -  " + to_adverb(w[1]))
// })
// console.log(adj_to_adv('direct'))
// "JJ  - adjective, generic (big, nice)",
// "JJR  - comparative adjective (bigger, cooler)",
// "JJS  - superlative adjective (biggest, fattest)"
var Adjective = function(str, next, last, token) {
	var the = this
	the.word = str || '';
	the.next = next
	the.last = last


	if (typeof module !== "undefined" && module.exports) {
		to_comparative = require("./conjugate/to_comparative")
		to_superlative = require("./conjugate/to_superlative")
		adj_to_adv = require("./conjugate/to_adverb")
		adj_to_noun = require("./conjugate/to_noun")
		parts_of_speech = require("../../data/parts_of_speech")
	}

	the.conjugate = function() {
		return {
			comparative: to_comparative(the.word),
			superlative: to_superlative(the.word),
			adverb: adj_to_adv(the.word),
			noun: adj_to_noun(the.word),
		}
	}

	the.which = (function() {
		if (the.word.match(/..est$/)) {
			return parts_of_speech['JJS']
		}
		if (the.word.match(/..er$/)) {
			return parts_of_speech['JJR']
		}
		return parts_of_speech['JJ']
	})()

	return the;
};
if (typeof module !== "undefined" && module.exports) {
	module.exports = Adjective;
}

// console.log(new Adjective("crazy").conjugate())
// console.log(new Adjective("crazy"))
// console.log(new Adjective("craziest"))
// console.log(new Adjective("crazier"))
//load if server-side, otherwise assume these are prepended already
if (typeof module !== "undefined" && module.exports) {
	Adjective = require("./adjective/index");
	Noun = require("./noun/index");
	Adverb = require("./adverb/index");
	Verb = require("./verb/index");
	Value = require("./value/index");
}
var parents = {
	adjective: function(str, next, last, token) {
		return new Adjective(str, next, last, token)
	},
	noun: function(str, next, last, token) {
		return new Noun(str, next, last, token)
	},
	adverb: function(str, next, last, token) {
		return new Adverb(str, next, last, token)
	},
	verb: function(str, next, last, token) {
		return new Verb(str, next, last, token)
	},
	value: function(str, next, last, token) {
		return new Value(str, next, last, token)
	},
	glue: function(str, next, last, token) {
		return {}
	}
}
if (typeof module !== "undefined" && module.exports) {
	module.exports = parents;
}

// console.log(parents)
var lexicon = (function() {

	// var verb_conjugate, adj_to_adv, verb_to_doer, to_superlative, to_comparative;
	if (typeof module !== "undefined" && module.exports) {
		verb_conjugate = require("../parents/verb/conjugate/conjugate")
		adj_to_adv = require("../parents/adjective/conjugate/to_adverb");
		verb_to_doer = require("../parents/verb/conjugate/to_doer");
		to_superlative = require("../parents/adjective/conjugate/to_superlative");
		to_comparative = require("../parents/adjective/conjugate/to_comparative");
	}
	var main = {
		//conjunctions
		"yet": "CC",
		"therefore": "CC",
		"or": "CC",
		"while": "CC",
		"nor": "CC",
		"whether": "CC",
		"though": "CC",
		"because": "CC",
		"but": "CC",
		"for": "CC",
		"and": "CC",
		"if": "CC",
		"however": "CC",
		"before": "CC",
		"although": "CC",
		"how": "CC",

		//numbers
		'zero': "CD",
		'one': "CD",
		'two': "CD",
		'three': "CD",
		'four': "CD",
		'five': "CD",
		'six': "CD",
		'seven': "CD",
		'eight': "CD",
		'nine': "CD",
		'ten': "CD",
		'eleven': "CD",
		'twelve': "CD",
		'thirteen': "CD",
		'fourteen': "CD",
		'fifteen': "CD",
		'sixteen': "CD",
		'seventeen': "CD",
		'eighteen': "CD",
		'nineteen': "CD",
		'twenty': "CD",
		'thirty': "CD",
		'forty': "CD",
		'fifty': "CD",
		'sixty': "CD",
		'seventy': "CD",
		'eighty': "CD",
		'ninety': "CD",
		'hundred': "CD",
		'thousand': "CD",
		'million': "CD",
		'billion': "CD",
		'trillion': "CD",
		'quadrillion': "CD",
		'quintillion': "CD",
		'sextillion': "CD",
		'septillion': "CD",
		'octillion': "CD",
		'nonillion': "CD",
		'decillion': "CD",




		//copula
		"is": "CP",
		"will be": "CP",
		"are": "CP",
		"was": "CP",
		"were": "CP",

		//determiners
		"this": "DT",
		"any": "DT",
		"enough": "DT",
		"each": "DT",
		"whatever": "DT",
		"every": "DT",
		"which": "DT",
		"these": "DT",
		"another": "DT",
		"plenty": "DT",
		"whichever": "DT",
		"neither": "DT",
		"an": "DT",
		"a": "DT",
		"least": "DT",
		"own": "DT",
		"few": "DT",
		"both": "DT",
		"those": "DT",
		"the": "DT",
		"that": "DT",
		"various": "DT",
		"what": "DT",
		"either": "DT",
		"much": "DT",
		"some": "DT",
		"else": "DT",
		//some other languages (what could go wrong?)
		"la": "DT",
		"le": "DT",
		"les": "DT",
		"des": "DT",
		"de": "DT",
		"du": "DT",
		"el": "DT",

		//prepositions
		"until": "IN",
		"onto": "IN",
		"of": "IN",
		"into": "IN",
		"out": "IN",
		"except": "IN",
		"across": "IN",
		"by": "IN",
		"between": "IN",
		"at": "IN",
		"down": "IN",
		"as": "IN",
		"from": "IN",
		"around": "IN",
		"with": "IN",
		"among": "IN",
		"upon": "IN",
		"amid": "IN",
		"to": "IN",
		"along": "IN",
		"since": "IN",
		"about": "IN",
		"off": "IN",
		"on": "IN",
		"within": "IN",
		"in": "IN",
		"during": "IN",
		"per": "IN",
		"without": "IN",
		"throughout": "IN",
		"through": "IN",
		"than": "IN",
		"via": "IN",
		"up": "IN",


		//modal verbs
		"can": "MD",
		"may": "MD",
		"could": "MD",
		"might": "MD",
		"will": "MD",
		"ought to": "MD",
		"would": "MD",
		"must": "MD",
		"shall": "MD",
		"should": "MD",


		//posessive pronouns
		"mine": "PP",
		"something": "PP",
		"none": "PP",
		"anything": "PP",
		"anyone": "PP",
		"lot": "PP",
		"theirs": "PP",
		"himself": "PP",
		"ours": "PP",
		"his": "PP",
		"my": "PP",
		"their": "PP",
		"yours": "PP",
		"your": "PP",
		"our": "PP",
		"its": "PP",
		"nothing": "PP",
		"herself": "PP",
		"hers": "PP",
		"themselves": "PP",
		"everything": "PP",
		"myself": "PP",
		"itself": "PP",
		"who": "PP",
		"her": "PP", //this one is pretty ambiguous

		//personal pronouns (nouns)
		"it": "PRP",
		"they": "PRP",
		"i": "PRP",
		"them": "PRP",
		"you": "PRP",
		"she": "PRP",
		"me": "PRP",
		"he": "PRP",
		"him": "PRP",
    "ourselves": "PRP",
		"us": "PRP",
		"we": "PRP",
		"thou": "PRP",
		"il": "PRP",
		"elle": "PRP",

		//some manual adverbs (the rest are generated)
		"now": "RB",
		"again": "RB",
		"already": "RB",
		"soon": "RB",
		"directly": "RB",
		"toward": "RB",
		"forever": "RB",
		"apart": "RB",
		"instead": "RB",
		"yes": "RB",
		"alone": "RB",
		"ago": "RB",
		"indeed": "RB",
		"ever": "RB",
		"quite": "RB",
		"perhaps": "RB",
		"where": "RB",
		"then": "RB",
		"here": "RB",
		"thus": "RB",
		"very": "RB",
		"often": "RB",
		"once": "RB",
		"never": "RB",
		"why": "RB",
		"when": "RB",
		"away": "RB",
		"always": "RB",
		"sometimes": "RB",
		"also": "RB",
		"maybe": "RB",
		"so": "RB",
		"just": "RB",
		"well": "RB",

		//interjections
		"uhh": "UH",
		"uh-oh": "UH",
		"ugh": "UH",
		"sheesh": "UH",
		"eww": "UH",
		"pff": "UH",
		"voila": "UH",
		"oy": "UH",
		"eep": "UH",
		"hurrah": "UH",
		"yuck": "UH",
		"ow": "UH",
		"duh": "UH",
		"oh": "UH",
		"hmm": "UH",
		"yeah": "UH",
		"whoa": "UH",
		"ooh": "UH",
		"whee": "UH",
		"ah": "UH",
		"bah": "UH",
		"gah": "UH",
		"yaa": "UH",
		"phew": "UH",
		"gee": "UH",
		"ahem": "UH",
		"eek": "UH",
		"meh": "UH",
		"yahoo": "UH",
		"oops": "UH",
		"d'oh": "UH",
		"psst": "UH",
		"argh": "UH",
		"grr": "UH",
		"nah": "UH",
		"shhh": "UH",
		"whew": "UH",
		"mmm": "UH",
		"yay": "UH",
		"uh-huh": "UH",
		"boo": "UH",
		"wow": "UH",


		//dates
		"july": "CD",
		"august": "CD",
		"september": "CD",
		"october": "CD",
		"november": "CD",
		"december": "CD",
		"january": "CD",
		"february": "CD",
		"march": "CD",
		"april": "CD",
		// "may": "CD",
		"june": "CD",
		"monday": "CD",
		"tuesday": "CD",
		"wednesday": "CD",
		"thursday": "CD",
		"friday": "CD",
		"saturday": "CD",
		"sunday": "CD",


		//contractions that don't need splitting-open, grammatically
		"don't": "VB",
		"isn't": "CP",
		"ain't": "CP",
		"aren't": "CP",
		"won't": "VB",
		"shouldn't": "MD",
		"wouldn't": "MD",
		"couldn't": "MD",
		"mustn't": "MD",
		"shan't": "MD",
		"shant": "MD",
		"lets": "MD", //arguable
		"let's": "MD",
		"what's": "VB", //somewhat ambiguous (what does|what are)
		"where'd": "VBD",
		"when'd": "VBD",
		"how'd": "VBD",
		"what'd": "VBD",
		"who'd": "MD",
		"'o": "IN",
		"'em": "PRP",

		//demonyms
		"afghan":"JJ",
		"albanian":"JJ",
		"algerian":"JJ",
		"argentine":"JJ",
		"armenian":"JJ",
		"australian":"JJ",
		"aussie":"JJ",
		"austrian":"JJ",
		"bangladeshi":"JJ",
		"belgian":"JJ",
		"bolivian":"JJ",
		"bosnian":"JJ",
		"brazilian":"JJ",
		"bulgarian":"JJ",
		"cambodian":"JJ",
		"canadian":"JJ",
		"chilean":"JJ",
		"chinese":"JJ",
		"colombian":"JJ",
		"croat":"JJ",
		"cuban":"JJ",
		"czech":"JJ",
		"dominican":"JJ",
		"egyptian":"JJ",
		"british":"JJ",
		"estonian":"JJ",
		"ethiopian":"JJ",
		"finnish":"JJ",
		"french":"JJ",
		"gambian":"JJ",
		"georgian":"JJ",
		"german":"JJ",
		"greek":"JJ",
		"haitian":"JJ",
		"hungarian":"JJ",
		"indian":"JJ",
		"indonesian":"JJ",
		"iranian":"JJ",
		"iraqi":"JJ",
		"irish":"JJ",
		"israeli":"JJ",
		"italian":"JJ",
		"jamaican":"JJ",
		"japanese":"JJ",
		"jordanian":"JJ",
		"kenyan":"JJ",
		"korean":"JJ",
		"kuwaiti":"JJ",
		"latvian":"JJ",
		"lebanese":"JJ",
		"liberian":"JJ",
		"libyan":"JJ",
		"lithuanian":"JJ",
		"macedonian":"JJ",
		"malaysian":"JJ",
		"mexican":"JJ",
		"mongolian":"JJ",
		"moroccan":"JJ",
		"dutch":"JJ",
		"nicaraguan":"JJ",
		"nigerian":"JJ",
		"norwegian":"JJ",
		"omani":"JJ",
		"pakistani":"JJ",
		"palestinian":"JJ",
		"filipino":"JJ",
		"polish":"JJ",
		"portuguese":"JJ",
		"qatari":"JJ",
		"romanian":"JJ",
		"russian":"JJ",
		"rwandan":"JJ",
		"samoan":"JJ",
		"saudi":"JJ",
		"scottish":"JJ",
		"senegalese":"JJ",
		"serbian":"JJ",
		"singaporean":"JJ",
		"slovak":"JJ",
		"somali":"JJ",
		"sudanese":"JJ",
		"swedish":"JJ",
		"swiss":"JJ",
		"syrian":"JJ",
		"taiwanese":"JJ",
		"thai":"JJ",
		"tunisian":"JJ",
		"ugandan":"JJ",
		"ukrainian":"JJ",
		"american":"JJ",
		"hindi":"JJ",
		"spanish":"JJ",
		"venezuelan":"JJ",
		"vietnamese":"JJ",
		"welsh":"JJ",
		"african":"JJ",
		"european":"JJ",
		"asian":"JJ",
		"californian":"JJ",

		//misc mine
		"nope": "UH",
		"am": "VBP",
		"said": "VBD",
		"says": "VBZ",
		"has": "VB",
		"more": "RBR",
		"had": "VBD",
		"been": "VBD",
    "going": "VBG",
		"other": "JJ",
		"no": "DT",
		"there": "EX",
		"after": "IN",
		"many": "JJ",
		"most": "JJ",
		"last": "JJ",
		"expected": "JJ",
		"long": "JJ",
		"far": "JJ",
		"due": "JJ",
		"higher": "JJR",
		"larger": "JJR",
		"better": "JJR",
		"added": "VB",
		"several": "RB",
		"such": "RB",
		"took": "VB",
		"being": "VBG",
		"began": "VBD",
		"came": "VBD",
		"did": "VBD",
		"go": "VBP",
		"too": "RB",
		"president": "NN",
		"dollar": "NN",
		"student": "NN",
		"patent": "NN",
		"funding": "NN",
		"morning": "NN",
		"banking": "NN",
		"ceiling": "NN",
		"energy": "NN",
		"secretary": "NN",
		"purpose": "NN",
		"friends": "NNS",
		"less": "JJ",
		"event":"NN",
		"divine": "JJ",
		"all": "JJ",
		"define": "VB",
    "went": "VBD",
    "goes": "VBZ",
    "sounds": "VBZ",
  "measure": "VB",
  "enhance": "VB",
  "distinguish": "VB",
    "randomly": "RB",
  "abroad": "RB",



		//missing words from amc
		"given": "VBN",
	  "known": "VBN",
	  "rather": "RB",
	  "shown": "VBN",
	  "seen": "VBN",
	  "according": "VBG",
	  "almost": "RB",
	  "together": "JJ",
	  "means": "VBZ",
	  "despite": "IN",
	  "only": "JJ",
	  "outside": "JJ",
	  "below": "IN",
	  "multiple": "JJ",
	  "anyway": "RB",
	  "appropriate": "JJ",
	  "unless": "IN",
	  "whom": "PP",
	  "whose": "PP",
	  "evil": "JJ",
	  "earlier": "JJR",
	  "etc": "FW",
	  "twice": "RB",
	  "avoid": "VB",
	  "favorite": "JJ",
	  "whereas": "IN",
	  "born": "VBN",
	  "hit": "VB",
	  "resulting": "VBG",
	  "limited": "JJ",
	  "developing": "VBG",
	  "plus": "CC",
	  "biggest": "JJS",
	  "random": "JJ",
	  "republican": "JJ",
	  "okay": "JJ",
	  "essential": "JJ",
	  "somewhat": "RB",
	  "unlike": "IN",
	  "secondary": "JJ",
	  "somehow": "RB",
	  "yourself": "PRP",
	  "gay": "JJ",
	  "meanwhile": "RB",
	  "hence": "RB",
	  "further": "RB",
	  "furthermore": "RB",
	  "easier": "JJR",
	  "staining": "VBG",
	  "towards": "IN",
	  "aside": "RB",
	  "moreover": "RB",
	  "south": "JJ",
	  "pro": "JJ",
	  "meant": "VBD",
	  "versus": "CC",
	  "besides": "IN",
	  "northern": "JJ",
	  "anymore": "RB",
	  "urban": "JJ",
	  "acute": "JJ",
	  "prime": "JJ",
	  "arab": "JJ",
	  "overnight": "JJ",
	  "newly": "RB",
	  "ought": "MD",
	  "mixed": "JJ",
	  "crucial": "JJ",
	  "damn": "RB",


    //formerly IN
		"behind": "JJ",
		"above": "JJ",
		"beyond": "JJ",
		"against": "JJ",
		"under": "JJ",

		"not":"CC",//?

		//from multiples
		"of course":"RB",
    "at least":"RB",
    "no longer":"RB",
    "sort of":"RB",
    "at first":"RB",
    "once again":"RB",
    "once more":"RB",
    "up to":"RB",
    "by now":"RB",
    "all but":"RB",
    "just about":"RB",
    "on board":"JJ",
    "a lot":"RB",
    "by far":"RB",
    "at best":"RB",
    "at large":"RB",
    "for good":"RB",
    "vice versa":"JJ",
    "en route":"JJ",
    "for sure":"RB",
    "upside down":"JJ",
    "at most":"RB",
    "per se":"RB",
    "at worst":"RB",
    "upwards of":"RB",
    "en masse":"RB",
    "point blank":"RB",
    "up front":"JJ",
    "in situ":"JJ",
    "in vitro":"JJ",
    "ad hoc":"JJ",
    "de facto":"JJ",
    "ad infinitum":"JJ",
    "ad nauseam":"RB",
    "for keeps":"JJ",
    "a priori":"FW",
    "et cetera":"FW",
    "off guard":"JJ",
    "spot on":"JJ",
    "ipso facto":"JJ",
    "not withstanding":"RB",
    "de jure":"RB",
    "a la":"IN",
    "ad hominem":"NN",
    "par excellence":"RB",
    "de trop":"RB",
    "a posteriori":"RB",
    "fed up":"JJ",
    "brand new":"JJ",
    "old fashioned":"JJ",
    "bona fide":"JJ",
    "well off":"JJ",
    "far off":"JJ",
    "straight forward":"JJ",
    "hard up":"JJ",
    "sui generis":"JJ",
    "en suite":"JJ",
    "avant garde":"JJ",
    "sans serif":"JJ",
    "gung ho":"JJ",
    "super duper":"JJ",

	}

	//verbs
	var verbs = [
		"collapse",
		"stake",
		"forsee",
		"hide",
		"suck",
		"answer",
		"argue",
		"tend",
		"examine",
		"depend",
		"form",
		"figure",
		"compete",
		"mind",
		"surround",
		"suspect",
		"reflect",
		"wonder",
		"act",
		"hope",
		"end",
		"thank",
		"file",
		"regard",
		"report",
		"imagine",
		"consider",
		"miss",
		"ensure",
		"cause",
		"work",
		"enter",
		"stop",
		"defeat",
		"surge",
		"launch",
		"turn",
		"give",
		"win",
		"like",
		"control",
		"relate",
		"remember",
		"join",
		"listen",
		"train",
		"break",
		"spring",
		"enjoy",
		"fail",
		"understand",
		"recognize",
		"draw",
		"obtain",
		"learn",
		"fill",
		"announce",
		"prevent",
		"fall",
		"achieve",
		"find",
		"realize",
		"involve",
		"remove",
		"lose",
		"lie",
		"build",
		"aid",
		"visit",
		"test",
		"strike",
		"prepare",
		"wait",
		"ask",
		"carry",
		"suppose",
		"determine",
		"raise",
		"send",
		"love",
		"use",
		"pull",
		"improve",
		"contain",
		"think",
		"offer",
		"speak",
		"rise",
		"talk",
		"pick",
		"care",
		"express",
		"remain",
		"operate",
		"deal",
		"close",
		"add",
		"mention",
		"read",
		"support",
		"grow",
		"decide",
		"walk",
		"vary",
		"demand",
		"describe",
		"sell",
		"agree",
		"happen",
		"allow",
		"suffer",
		"have",
		"study",
		"be",
		"press",
		"watch",
		"seem",
		"occur",
		"contribute",
		"claim",
		"become",
		"make",
		"compare",
		"develop",
		"apply",
		"direct",
		"discuss",
		"know",
		"sit",
		"see",
		"lead",
		"indicate",
		"require",
		"change",
		"fix",
		"come",
		"reach",
		"prove",
		"expect",
		"exist",
		"play",
		"permit",
		"meet",
		"kill",
		"pay",
		"charge",
		"increase",
		"fight",
		"tell",
		"catch",
		"believe",
		"create",
		"continue",
		"live",
		"help",
		"represent",
		"edit",
		"serve",
		"ride",
		"appear",
		"cover",
		"set",
		"maintain",
		"start",
		"stay",
		"move",
		"extend",
		"leave",
		"wear",
		"run",
		"design",
		"supply",
		"suggest",
		"want",
		"say",
		"hear",
		"drive",
		"approach",
		"cut",
		"call",
		"include",
		"try",
		"receive",
		"save",
		"discover",
		"marry",
		"throw",
		"show",
		"choose",
		"need",
		"establish",
		"keep",
		"assume",
		"attend",
		"buy",
		"unite",
		"feel",
		"explain",
		"publish",
		"accept",
		"settle",
		"reduce",
		"bring",
		"do",
		"let",
		"shoot",
		"look",
		"take",
		"interact",
		"concern",
		"put",
		"labor",
		"hold",
		"return",
		"select",
		"die",
		"provide",
		"seek",
		"stand",
		"spend",
		"begin",
		"get",
		"wish",
		"hang",
		"write",
		"finish",
		"follow",
		"forget",
		"feed",
		"eat",
		"disagree",
		"produce",
		"attack",
		"attempt",
		"bite",
		"blow",
		"brake",
		"brush",
		"burn",
		"bang",
		"bomb",
		"bet",
		"budget",
		"comfort",
		"cook",
		"copy",
		"cough",
		"crush",
		"cry",
		"check",
		"claw",
		"clip",
		"combine",
		"damage",
		"desire",
		"doubt",
		"drain",
		"drink",
		"dance",
		"decrease",
		"defect",
		"deposit",
		"drift",
		"dip",
		"dive",
		"divorce",
		"dream",
		"exchange",
		"envy",
		"exert",
		"exercise",
		"export",
		"fold",
		"flood",
		"focus",
		"forecast",
		"fracture",
		"grip",
		"guide",
		"guard",
		"guarantee",
		"guess",
		"hate",
		"heat",
		"handle",
		"hire",
		"host",
		"hunt",
		"hurry",
		"import",
		"judge",
		"jump",
		"jam",
		"kick",
		"kiss",
		"knock",
		"laugh",
		"lift",
		"lock",
		"lecture",
		"link",
		"load",
		"loan",
		"lump",
		"melt",
		"message",
		"murder",
		"neglect",
		"overlap",
		"overtake",
		"overuse",
		"print",
		"protest",
		"pump",
		"push",
		"post",
		"progress",
		"promise",
		"purchase",
		"regret",
		"request",
		"reward",
		"roll",
		"rub",
		"rent",
		"repair",
		"sail",
		"scale",
		"screw",
		"shake",
		"shock",
		"sleep",
		"slip",
		"smash",
		"smell",
		"smoke",
		"sneeze",
		"snow",
		"stick",
		"surprise",
		"swim",
		"scratch",
		"search",
		"share",
		"shave",
		"slide",
		"spit",
		"splash",
		"stain",
		"stress",
		"swing",
		"switch",
		"taste",
		"touch",
		"trade",
		"trick",
		"twist",
		"tie",
		"trap",
		"travel",
		"tune",
		"undergo",
		"undo",
		"uplift",
		"vote",
		"wash",
		"wave",
		"whistle",
		"wreck",
		"yawn",
		"betray",
		"restrict",
		"perform",
	  "worry",
	  "point",
	  "activate",
	  "fear",
	  "plan",
	  "note",
	  "face",
	  "predict",
	  "differ",
	  "deserve",
	  "torture",
	  "recall",
	  "count",
	  "swear",
	  "admit",
	  "insist",
	  "lack",
	  "pass",
	  "belong",
	  "complain",
	  "constitute",
	  "beat",
	  "rely",
	  "refuse",
	  "range",
	  "cite",
	  "flash",
	  "arrive",
	  "reveal",
	  "consist",
	  "observe",
	  "notice",
	  "trust",
	  "imply",
	  "display",
	  "view",
	  "stare",
	  "acknowledge",
	  "owe",
	  "gaze",
	  "treat",
	  "account",
	  "gather",
	  "address",
	  "confirm",
	  "estimate",
	  "manage",
	  "participate",
	  "sneak",
	  "drop",
	  "mirror",
	  "experience",
	  "strive",
	  "teach",
	  "cost",
	  "arch",
	  "dislike",
	  "favor",
	  "earn",
	  "emphasize",
	  "fly",
	  "match",
	  "question",
	  "emerge",
	  "encourage",
	  "matter",
	  "name",
	  "head",
	  "line",
	  "slam",
	  "list",
	  "sing",
	  "warn",
	  "ignore",
	  "resemble",
	  "spread",
	  "feature",
	  "place",
	  "reverse",
	  "accuse",
	  "spoil",
	  "retain",
	  "survive",
	  "praise",
	  "function",
	  "please",
	  "date",
	  "remind",
	  "deliver",
	  "echo",
	  "engage",
	  "deny",
	  "obey",
	  "yield",
	  "center",
	  "gain",
	  "anticipate",
	  "reason",
	  "side",
	  "thrive",
	  "defy",
	  "dodge",
	  "enable",
	  "applaud",
	  "bear",
	  "persist",
	  "pose",
	  "reject",
	  "attract",
	  "await",
	  "inhibit",
	  "declare",
	  "process",
	  "risk",
	  "urge",
	  "value",
	  "block",
	  "confront",
	  "credit",
	  "cross",
	  "wake",
	  "amuse",
	  "dare",
	  "resent",
	  "smile",
	  "gloss",
	  "threaten",
	  "collect",
	  "depict",
	  "dismiss",
	  "submit",
	  "benefit",
	  "step",
	  "deem",
	  "limit",
	  "sense",
	  "issue",
	  "embody",
	  "force",
	  "govern",
	  "replace",
	  "aim",
	  "bother",
	  "cater",
	  "adopt",
	  "empower",
	  "outweigh",
	  "alter",
	  "enrich",
	  "influence",
	  "prohibit",
	  "pursue",
	  "warrant",
	  "convey",
	  "approve",
	  "reserve",
	  "rest",
	  "strain",
	  "wander",
	  "adjust",
	  "dress",
	  "market",
	  "mingle",
	  "disapprove",
	  "evaluate",
	  "flow",
	  "inhabit",
	  "pop",
	  "rule",
	  "depart",
	  "roam",
	  "assert",
	  "disappear",
	  "envision",
	  "pause",
	  "afford",
	  "challenge",
	  "grab",
	  "grumble",
	  "house",
	  "portray",
	  "revel",
	  "base",
	  "conduct",
	  "review",
	  "stem",
	  "crave",
	  "mark",
	  "store",
	  "target",
	  "unlock",
	  "weigh",
	  "resist",
	  "steal",
	  "drag",
	  "pour",
	  "reckon",
	  "assign",
	  "cling",
	  "rank",
	  "attach",
	  "decline",
	  "destroy",
	  "interfere",
	  "paint",
	  "skip",
	  "sprinkle",
	  "wither",
	  "allege",
	  "retire",
	  "score",
	  "monitor",
	  "expand",
	  "honor",
	  "lend",
	  "pack",
	  "assist",
	  "float",
	  "appeal",
	  "sink",
	  "stretch",
	  "undermine",
	  "assemble",
	  "boast",
	  "bounce",
	  "grasp",
	  "install",
	  "borrow",
	  "crack",
	  "elect",
	  "shine",
	  "shout",
	  "contrast",
	  "overcome",
	  "relax",
	  "relent",
	  "strengthen",
	  "conform",
	  "dump",
	  "pile",
	  "scare",
	  "relive",
	  "resort",
	  "rush",
	  "boost",
	  "cease",
	  "command",
	  "excel",
	  "plug",
	  "plunge",
	  "proclaim",
	  "discourage",
	  "endure",
	  "ruin",
	  "stumble",
	  "abandon",
	  "cheat",
	  "convince",
	  "merge",
	  "convert",
	  "harm",
	  "multiply",
	  "overwhelm",
	  "chew",
	  "invent",
	  "bury",
	  "wipe",
	]

	//conjugate all of these verbs. takes ~8ms. triples the lexicon size.
	verbs.forEach(function(v) {
		var c = verb_conjugate(v)
		main[c.infinitive]= main[c.infinitive] || "VBP"
		main[c.past] = main[c.past] || "VBD"
		main[c.gerund] = main[c.gerund] || "VBG"
		main[c.present] = main[c.present] || "VBZ"
		if(c.participle && !main[c.participle]){
			main[c.participle]="VBN"
		}
		var doer = verb_to_doer(v)
		if (doer) {
			main[doer] = "NNA"
		}
	})



	//adjectives that either aren't covered by rules, or have superlative/comparative forms
	var adjectives = [
	  'colonial',
	  'moody',
	  'literal',
	  'actual',
	  'probable',
	  'apparent',
	  'usual',
	  'aberrant',
		'ablaze',
		'able',
		'absolute',
		'aboard',
		'abrupt',
		'absent',
		'absorbing',
		'absurd',
		'abundant',
		'accurate',
		'adult',
		'afraid',
		'agonizing',
		'ahead',
		'alert',
		'alive',
		'aloof',
		'amazing',
		'arbitrary',
		'arrogant',
		'asleep',
		'astonishing',
		'average',
		'awake',
		'aware',
		'awkward',
		'back',
		'bad',
		'bankrupt',
		'bawdy',
		'beneficial',
		'bent',
		'best',
		'better',
		'big',
		'bitter',
		'bizarre',
		'black',
		'bloody',
		'blue',
		'bouncy',
		'brash',
		'brave',
		'brief',
		'bright',
		'brilliant',
		'broad',
		'broken',
		'brown',
		'burly',
		'busy',
		'cagey',
		'calm',
		'careful',
		'caring',
		'certain',
		'charming',
		'cheap',
		'chief',
		'chilly',
		'civil',
		'clever',
		'close',
		'closed',
		'cloudy',
		'cold',
		'colossal',
		'commercial',
		'common',
		'complete',
		'complex',
		'concerned',
		'concrete',
		'congruent',
		'constant',
		'cooing',
		'cool',
		'correct',
		'cowardly',
		'craven',
		'cruel',
		'cuddly',
		'curly',
		'cute',
		'daily',
		'damaged',
		'damaging',
		'damp',
		'dapper',
		'dark',
		'dashing',
		'dead',
		'deadpan',
		'dear',
		'deep',
		'deeply',
		'defiant',
		'degenerate',
		'delicate',
		'delightful',
		'desperate',
		'determined',
		'didactic',
		'difficult',
		'discreet',
		'done',
		'double',
		'doubtful',
		'downtown',
		'dreary',
		'drunk',
		'dry',
		'dull',
		'eager',
		'early',
		'east',
		'eastern',
		'easy',
		'elderly',
		'elegant',
		'elfin',
		'elite',
		'eminent',
		'empty',
		'encouraging',
		'entire',
		'erect',
		'ethereal',
		'even',
		'exact',
		'expert',
		'extra',
		'extreme',
		'exuberant',
		'exultant',
		'faint',
		'fair',
		'false',
		'fanc',
		'fancy',
		'fast',
		'fat',
		'faulty',
		'feeble',
		'female',
		'fertile',
		'few',
		'fierce',
		'fierce ',
		'financial',
		'fine',
		'firm',
		'first',
		'fit',
		'fixed',
		'flagrant',
		'flat',
		'foamy',
		'foolish',
		'foregoing',
		'foreign',
		'forgetful',
		'former',
		'fortunate',
		'frail',
		'frantic',
		'free',
		'freezing',
		'frequent',
		'fresh',
		'fretful',
		'friendly',
		'full',
		'fun',
		'funny',
		'furry',
		'future',
		'gainful',
		'gaudy',
		'gentle',
		'giant',
		'giddy',
		'gigantic',
		'glad',
		'gleaming',
		'glib',
		'global',
		'gold',
		'gone',
		'good',
		'goofy',
		'graceful',
		'grand',
		'grateful',
		'gratis',
		'gray',
		'great',
		'green',
		'grey',
		'groovy',
		'gross',
		'guarded',
		'half',
		'handy',
		'hanging',
		'hard',
		'harsh',
		'hateful',
		'heady',
		'heavenly',
		'heavy',
		'hellish',
		'helpful',
		'hesitant',
		'high',
		'highfalutin',
		'hollow',
		'homely',
		'honest',
		'hot',
		'huge',
		'humdrum',
		'hurried',
		'hurt',
		'icy',
		'ignorant',
		'ill',
		'illegal',
		'immediate',
		'immense',
		'imminent',
		'impartial',
		'imperfect',
		'impolite',
		'important',
		'imported',
		'initial',
		'innate',
		'inner',
		'inside',
		'irate',
		'jolly',
		'juicy',
		'junior',
		'juvenile',
		'kaput',
		'keen',
		'kind',
		'kindly',
		'knowing',
		'labored',
		'lame',
		'languid',
		'large',
		'late',
		'latter',
		'learned',
		'left',
		'legal',
		'lethal',
		'level',
		'lewd',
		'light',
		'likely',
		'literate',
		'lively',
		'living',
		'lonely',
		'longing',
		'loose',
		'loud',
		'loutish',
		'lovely',
		'loving',
		'low',
		'lowly',
		'lush',
		'luxuriant',
		'lying',
		'macabre',
		'macho',
		'mad',
		'madly',
		'magenta',
		'main',
		'major',
		'makeshift',
		'male',
		'mammoth',
		'married',
		'mature',
		'measly',
		'meaty',
		'medium',
		'meek',
		'mellow',
		'mere',
		'middle',
		'miniature',
		'minor',
		'miscreant',
		'mobile',
		'moldy',
		'mundane',
		'mute',
		'naive',
		'narrow',
		'near',
		'nearby',
		'neat',
		'necessary',
		'neighborly',
		'new',
		'next',
		'nice',
		'nimble',
		'noisy',
		'nonchalant',
		'nondescript',
		'nonstop',
		'north',
		'nosy',
		'obeisant',
		'obese',
		'obscene',
		'observant',
		'obsolete',
		'odd',
		'offbeat',
		'official',
		'ok',
		'old',
		'open',
		'opposite',
		'orange',
		'organic',
		'outdoor',
		'outer',
		'outgoing',
		'oval',
		'over',
		'overall',
		'overt',
		'overweight',
		'overwrought',
		'painful',
		'pale',
		'past',
		'peaceful',
		'perfect',
		'petite',
		'picayune',
		'pink',
		'placid',
		'plain',
		'plant',
		'pleasant',
		'polite',
		'poor',
		'potential',
		'pregnant',
		'premium',
		'present',
		'pricey',
		'prickly',
		'primary',
		'prior',
		'private',
		'profuse',
		'proper',
		'public',
		'pumped',
		'puny',
		'pure',
		'purple',
		'quack',
		'quaint',
		'quick',
		'quickest',
		'quiet',
		'rabid',
		'racial',
		'rare',
		'raw',
		'ready',
		'real',
		'rebel',
		'recondite',
		'red',
		'redundant',
		'relevant',
		'remote',
		'resolute',
		'resonant',
		'rich',
		'right',
		'rightful',
		'ripe',
		'ritzy',
		'robust',
		'romantic',
		'roomy',
		'rotten',
		'rough',
		'round',
		'royal',
		'rude',
		'sad',
		'safe',
		'salty',
		'same',
		'scarce',
		'scary',
		'scientific',
		'screeching',
		'second',
		'secret',
		'secure',
		'sedate',
		'seemly',
		'selfish',
		'senior',
		'separate',
		'severe',
		'shallow',
		'sharp',
		'shiny',
		'shocking',
		'short',
		'shrill',
		'shut',
		'shy',
		'sick',
		'significant',
		'silly',
		'simple',
		'sincere',
		'single',
		'skinny',
		'slight',
		'slim',
		'slimy',
		'slow',
		'small',
		'smelly',
		'smooth',
		'snobbish',
		'social',
		'soft',
		'somber',
		'soon',
		'sordid',
		'sore',
		'sorry',
		'sour',
		'southern',
		'spare',
		'special',
		'specific',
		'spicy',
		'splendid',
		'square',
		'squeamish',
		'stale',
		'standard',
		'standing',
		'steadfast',
		'steady',
		'steep',
		'stereotyped',
		'stiff',
		'still',
		'straight',
		'strange',
		'strict',
		'striped',
		'strong',
		'stupid',
		'sturdy',
		'subdued',
		'subsequent',
		'substantial',
		'sudden',
		'super',
		'superb',
		'superficial',
		'supreme',
		'sure',
		'sweet',
		'swift',
		'taboo',
		'tall',
		'tame',
		'tan',
		'tart',
		'tasteful',
		'tawdry',
		'telling',
		'temporary',
		'tender',
		'tense',
		'terrific',
		'tested',
		'thick',
		'thin',
		'thoughtful',
		'tidy',
		'tight',
		'tiny',
		'top',
		'torpid',
		'tough',
		'tranquil',
		'trite',
		'true',
		'ugly',
		'ultra',
		'unbecoming',
		'understood',
		'uneven',
		'unfair',
		'unlikely',
		'unruly',
		'unsightly',
		'untidy',
		'unwritten',
		'upbeat',
		'upper',
		'uppity',
		'upset',
		'upstairs',
		'uptight',
		'used',
		'useful',
		'utter',
		'uttermost',
		'vagabond',
		'vague',
		'vanilla',
		'various',
		'vast',
		'vengeful',
		'verdant',
		'violet',
		'volatile',
		'vulgar',
		'wanting',
		'warm',
		'wary',
		'wasteful',
		'weak',
		'weary',
		'weekly',
		'weird',
		'welcome',
		'western',
		'wet',
		'white',
		'whole',
		'wholesale',
		'wide',
		'wild',
		'windy',
		'wiry',
		'wise',
		'wistful',
		'womanly',
		'wooden',
		'woozy',
		'wound',
		'wrong',
		'wry',
		'yellow',
		'young',
		'zany',
		'sacred',
		//words that have good comparative/superlative forms
		'aggressive',
		'awesome',
		'beautiful',
		'bored',
		'boring',
		'clean',
		'dirty',
		'efficient',
		'gruesome',
		'handsome',
		'innocent',
		'lean',
		'little',
		'long',
		'mean',
		'normal',
		'proud',
		'rapid',
		'scared',
		'smart',
		'thirsty',
		'hungry',
		'clear',
		'happy',
		'lucky',
		'pretty',
		'interesting',
		'attractive',
		'dangerous',
		'intellegent',
		'formal',
		'tired',
		'solid',
		'angry',

	  "unknown",
	  "detailed",
	  "ongoing",
	  "prominent",
	  "permanent",
	  "diverse",
	  "partial",
	  "moderate",
	  "contemporary",
	  "intense",
	  "widespread",
	  "ultimate",
	  "ideal",
	  "adequate",
	  "sophisticated",
	  "naked",
	  "dominant",
	  "precise",
	  "intact",
	  "adverse",
	  "genuine",
	  "subtle",
	  "universal",
	  "resistant",
	  "routine",
	  "distant",
	  "unexpected",
	  "soviet",
	  "blind",
	  "artificial",
	  "mild",
	  "legitimate",
	  "unpublished",
	  "superior",
	  "intermediate",
	  "everyday",
	  "dumb",
	  "excess",
	  "sexy",
	  "fake",
	  "monthly",
	  "premature",
	  "sheer",
	  "generic",
	  "insane",
	  "contrary",
	  "twin",
	  "upcoming",
	  "bottom",
	  "costly",
	  "indirect",
	  "sole",
	  "unrelated",
	  "hispanic",
	  "improper",
	  "underground",
	  "legendary",
	  "reluctant",
	  "beloved",
	  "inappropriate",
	  "corrupt",
	  "irrelevant",
	  "justified",
	  "obscure",
	  "profound",
	  "hostile",
	  "influential",
	  "inadequate",
	  "abstract",
	  "timely",
	  "authentic",
	  "bold",
	  "intimate",
	  "straightforward",
	  "rival",
	  "right-wing",
	  "racist",
	  "symbolic",
	  "unprecedented",
	  "loyal",
	  "talented",
	  "troubled",
	  "noble",
	  "instant",
	  "incorrect",
	  "dense",
	  "blond",
	  "deliberate",
	  "blank",
	  "rear",
	  "feminine",
	  "apt",
	  "stark",
	  "alcoholic",
	  "teenage",
	  "vibrant",
	  "humble",
	  "vain",
	  "covert",
	  "bland",
	  "trendy",
	  "foul",
	  "populist",
	  "alarming",
	  "hooked",
	  "wicked",
	  "deaf",
	  "left-wing",
	  "lousy",
	  "malignant",
	  "stylish",
	  "upscale",
	  "hourly",
	  "refreshing",
	  "cozy",
	  "slick",
	  "dire",
	  "yearly",
	  "inbred",
	  "part-time",
	  "finite",
	  "backwards",
	  "nightly",
	  "unauthorized",
	  "cheesy",
	  "indoor",
	  "surreal",
	  "bald",
	  "masculine",
	  "shady",
	  "spirited",
	  "eerie",
	  "horrific",
	  "smug",
	  "stern",
	  "hefty",
	  "savvy",
	  "bogus",
	  "elaborate",
	  "gloomy",
	  "pristine",
	  "extravagant",
	  "serene",
	  "advanced",
	  "perverse",
	  "devout",
	  "crisp",
	  "rosy",
	  "slender",
	  "melancholy",
	  "faux",
	  "phony",
	  "danish",
	  "lofty",
	  "nuanced",
	  "lax",
	  "adept",
	  "barren",
	  "shameful",
	  "sleek",
	  "solemn",
	  "vacant",
	  "dishonest",

	  "brisk",
	  "fluent",
	  "insecure",
	  "humid",
	  "menacing",
	  "moot",

	  "soothing",
	  "self-loathing",
	  "far-reaching",
	  "harrowing",
	  "scathing",
	  "perplexing",
	  "calming",
	  "unconvincing",
	  "unsuspecting",

	  "unassuming",
	  "surprising",
	  "unappealing",
	  "vexing",
	  "unending",
	  "easygoing",
	  "appetizing",
	  "disgruntled",
	  "retarded",
	  "undecided",
	  "unregulated",
	  "unsupervised",
	  "unrecognized",
	  "crazed",
	  "distressed",
	  "jagged",
	  "paralleled",
	  "cramped",
	  "warped",
	  "antiquated",
	  "fabled",
	  "deranged",
	  "diseased",
	  "ragged",
	  "intoxicated",
	  "hallowed",
		"crowded",

	  "ghastly",
	  "disorderly",
	  "saintly",
	  "wily",
	  "sly",
	  "sprightly",
	  "ghostly",
	  "oily",
	  "hilly",
	  "grisly",
	  "earthly",
	  "friendly",
	  "unwieldy",

	]

	//conjugate all of these adjectives to their adverbs. (13ms)
	adjectives.forEach(function(j) {
		main[j] = "JJ"
		var adv = adj_to_adv(j)
		if (adv && adv != j && !main[adv]) {
			// console.log(adv)
			main[adv] = main[adv] || "RB"
		}
		var comp = to_comparative(j)
		if (comp && !comp.match(/^more ./) && comp != j && !main[comp]) {
			// console.log(comp)
			main[comp] = main[comp] || "JJR"
		}
		var sup = to_superlative(j)
		if (sup && !sup.match(/^most ./) && sup != j && !main[sup]) {
			// console.log(sup)
			main[sup] = main[sup] || "JJS"
		}
	})


	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}

	return main
})()
// console.log(Object.keys(lexicon).length)
// console.log(lexicon['weaker'])
// console.log(lexicon['restricted'])
// console.log(lexicon['whose'])
// console.log(lexicon['sleeping'])

// methods that hang on a parsed set of words
// accepts parsed tokens
var Sentence = function(tokens) {
	var the = this
	the.tokens = tokens || [];

	the.tense = function() {
		var verbs = the.tokens.filter(function(token) {
			return token.pos.parent == "verb"
		})
		return verbs.map(function(v) {
			return v.analysis.tense
		})
	}

	the.to_past = function() {
		the.tokens = the.tokens.map(function(token) {
			if (token.pos.parent == "verb") {
				token.text = token.analysis.to_past()
				token.normalised = token.text
			}
			return token
		})
		return the
	}
	the.to_present = function() {
		the.tokens = the.tokens.map(function(token) {
			if (token.pos.parent == "verb") {
				token.text = token.analysis.to_present()
				token.normalised = token.text
			}
			return token
		})
		return the
	}
	the.to_future = function() {
		the.tokens = the.tokens.map(function(token) {
			if (token.pos.parent == "verb") {
				token.text = token.analysis.to_future()
				token.normalised = token.text
			}
			return token
		})
		return the
	}

	the.insert = function(token, i) {
		if (i && token) {
			the.tokens.splice(i, 0, token);
		}
	}

	the.negate = function() {
		//if it's already negative, don't touch it
		for (var i = 0; i < the.tokens.length; i++) {
			if (the.tokens[i].analysis.negative) {
				return the
			}
		}
		//first at 'not' before copulas
		var _l = the.tokens.length
		for (var i = 0; i < _l; i++) { //this modifies array while looping
			if (the.tokens[i].pos && the.tokens[i].pos.tag == "CP" && !the.tokens[i].analysis.negative) {
				var token = {
					text: "not"
				}
				//set surrounding verbs as negative
				the.tokens[i].analysis.negative = true
				if (the.tokens[i + 1] && the.tokens[i + 1].analysis) {
					the.tokens[i + 1].analysis.negative = true
				}
				the.insert(token, i + 1)
			}
		}
		//then, address other verbs
		var verb_negations = {
			past: "didn't",
			present: "doesn't",
			future: "won't",
			gerund: "isn't",
		}
		var _l = the.tokens.length
		for (var i = 0; i < _l; i++) {
			if (the.tokens[i].pos && the.tokens[i].pos.parent == "verb" && !the.tokens[i].analysis.negative) {
				var tense = the.tokens[i].analysis.tense || 'present'
				//set it as negative
				the.tokens[i].analysis.negative = true
				//set it as present tense
				if (tense != 'gerund') {
					the.tokens[i].text = the.tokens[i].analysis.conjugate().infinitive
					the.tokens[i].normalised = the.tokens[i].text
				}
				var token = {
					text: verb_negations[tense],
					normalised: verb_negations[tense],
				}
				the.insert(token, i)
			}
		}
		return the
	}


  the.entities=function(options){
    var spots=[]
  	options=options||{}
		the.tokens.forEach(function(token) {
			if (token.pos.parent == "noun" && token.analysis.is_entity) {
				spots.push(token)
			}
		})
		if (options.ignore_gerund) {
			spots = spots.filter(function(t) {
				return t.pos.tag != "VBG"
			})
		}
		return spots
  }



	the.text = function() {
		return the.tokens.map(function(s) {
			return s.text
		}).join(' ')
	}


	//sugar 'grab' methods
	the.verbs = function() {
		return the.tokens.filter(function(t) {
			return t.pos.parent=="verb"
		})
	}
	the.adverbs = function() {
		return the.tokens.filter(function(t) {
			return t.pos.parent=="adverb"
		})
	}
	the.nouns = function() {
		return the.tokens.filter(function(t) {
			return t.pos.parent=="noun"
		})
	}
	the.adjectives = function() {
		return the.tokens.filter(function(t) {
			return t.pos.parent=="adjective"
		})
	}
	the.values = function() {
		return the.tokens.filter(function(t) {
			return t.pos.parent=="value"
		})
	}
	the.tags = function() {
		return the.tokens.map(function(t) {
			return t.pos.tag
		})
	}

	return the
}
if (typeof module !== "undefined" && module.exports) {
	module.exports = Sentence;
}

// pos = require("./pos")
//gerund negation
// tokens = pos('joe is so cool, he is going')[0].tokens
//non-gerund verb negations
// tokens = pos('joe swims to the bank')[0].tokens
// tokens = pos('joe swam to the bank')[0].tokens
// tokens = pos('joe swam to the bank')[0].tokens
// tokens = pos('joe is swimming to the bank')[0].tokens
// tokens = pos('joe is not swimming to the bank')[0].tokens //already negative
// tokens = pos('the chimney was so yellow')[0].tokens

// s = new Sentence(tokens).negate().tokens[2].analysis.conjugate()
// console.log(s)
// console.log(s)
// s = new Sentence(tokens)
// s.to_past()
// console.log(s)
// console.log(s.text())
// s.to_present()
// console.log(s.text())
// s.to_future()
// console.log(s.text())

// s=pos('the chimneys are so yellow')[0]
// console.log(s.to_past().text())
//a block of text, with an arbitrary number of sentences
var Section = function(sentences) {
  var the = this
  the.sentences = sentences || [];

  the.text= function(){
    return the.sentences.map(function(s){
      return s.text()
    }).join(' ')
  }
  the.nouns= function(){
    return the.sentences.map(function(s){
      return s.nouns()
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }
  the.entities= function(options){
    return the.sentences.map(function(s){
      return s.entities(options)
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }
  the.adjectives= function(){
    return the.sentences.map(function(s){
      return s.adjectives()
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }
  the.verbs= function(){
    return the.sentences.map(function(s){
      return s.verbs()
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }
  the.adverbs= function(){
    return the.sentences.map(function(s){
      return s.adverbs()
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }
  the.values= function(){
    return the.sentences.map(function(s){
      return s.values()
    }).reduce(function(arr, a){return arr.concat(a)},[])
  }

}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Section;
}
var pos = (function() {
	// "use strict";

	if (typeof module !== "undefined" && module.exports) {
		tokenize = require("./methods/tokenization/tokenize").tokenize;
		parts_of_speech = require("./data/parts_of_speech")
		word_rules = require("./data/word_rules")
		lexicon = require("./data/lexicon")
		wordnet_suffixes = require("./data/unambiguous_suffixes")
		Sentence = require("./sentence")
		Section = require("./section")
		parents = require("./parents/parents")
	}

	var merge_tokens = function(a, b) {
		a.text += " " + b.text
		a.normalised += " " + b.normalised
		a.pos_reason += "|" + b.pos_reason
		a.start = a.start || b.start
		a.capitalised = a.capitalised || b.capitalised
		a.end = a.end || b.end
		return a
	}

	//combine adjacent neighbours, and special cases
	var combine_tags = function(sentence) {
		var arr = sentence.tokens
		var better = []
		for (var i = 0; i <= arr.length; i++) {
			var next = arr[i + 1]
			if (arr[i] && next) {
				//'joe smith' are both NN
				if (arr[i].pos.tag == next.pos.tag && arr[i].punctuated != true && next.punctuated != true && arr[i].capitalised==next.capitalised) {
					arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					arr[i] = null
				}
				//'will walk' -> future-tense verb
				else if (arr[i].normalised == "will" && next.pos.parent == "verb") {
					arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					arr[i] = null
				}
				//'hundred and fifty'
				else if (arr[i].pos.tag == "CD" && next.normalised == "and" && arr[i + 2] && arr[i + 2].pos.tag == "CD") {
					arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					arr[i] = null
				}
				//'toronto fun festival'
				// else if (arr[i].pos.tag == "NN" && next.pos.tag == "JJ" && arr[i + 2] && arr[i + 2].pos.tag == "NN") {
					// arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					// arr[i] = null
				// }
				//capitals surrounding a preposition  'United States of America'
				else if (i>0 && arr[i].capitalised && next.normalised=="of" && arr[i+2] && arr[i+2].capitalised) {
					arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					arr[i] = null
					arr[i + 2] = merge_tokens(arr[i+1], arr[i + 2])
					arr[i + 1] = null
				}
				//capitals surrounding two prepositions  'Phantom of the Opera'
				else if (arr[i].capitalised && next.normalised=="of" && arr[i+2] && arr[i+2].pos.tag=="DT" && arr[i+3] && arr[i+3].capitalised) {
					arr[i + 1] = merge_tokens(arr[i], arr[i + 1])
					arr[i] = null
					arr[i + 2] = merge_tokens(arr[i+1], arr[i + 2])
					arr[i + 1] = null
				}
			}
			better.push(arr[i])
		}
		sentence.tokens = better.filter(function(r) {
			return r
		})
		return sentence
	}


	var lexicon_pass = function(w) {
		if (lexicon[w]) {
			return parts_of_speech[lexicon[w]]
		}
		//try to match it without a prefix - eg. outworked -> worked
		if(w.match(/^(over|under|out|-|un|re|en).{4}/)){
			var attempt=w.replace(/^(over|under|out|.*?-|un|re|en)/, '')
			return parts_of_speech[lexicon[attempt]]
		}
	}

	var rules_pass = function(w) {
		for (var i = 0; i < word_rules.length; i++) {
			if (w.match(word_rules[i].reg)) {
				return parts_of_speech[word_rules[i].pos]
			}
		}
	}


	var fourth_pass = function(token, i, sentence) {
		var last = sentence.tokens[i - 1]
		var next = sentence.tokens[i + 1]
		var strong_determiners= {
			"the":1,
			"a":1,
			"an":1,
		}
		//if it's before a modal verb, it's a noun -> lkjsdf would
		if (next && token.pos.parent != "noun" && token.pos.parent != "glue" && next.pos.tag == "MD") {
			token.pos = parts_of_speech['NN']
			token.pos_reason = "before a modal"
		}
		//if it's after an adverb, it's not a noun -> quickly acked
		//support form 'atleast he is..'
		if (last && token.pos.parent == "noun" && last.pos.tag == "RB" && !last.start) {
			token.pos = parts_of_speech['VB']
			token.pos_reason = "after an adverb"
		}
		//no consecutive, unpunctuated adjectives -> real good
		if (next && token.pos.parent == "adjective" && next.pos.parent == "adjective" && !token.punctuated) {
			token.pos = parts_of_speech['RB']
			token.pos_reason = "consecutive_adjectives"
		}
		//if it's after a determiner, it's not a verb -> the walk
		if (last && token.pos.parent == "verb" && strong_determiners[last.pos.normalised] && token.pos.tag!="CP") {
			token.pos = parts_of_speech['NN']
			token.pos_reason = "determiner-verb"
		}
		//copulas are followed by a determiner ("are a .."), or an adjective ("are good")
		//(we would have gotten the adverb already)
		if (last && last.pos.tag == "CP" && token.pos.tag != "DT" && token.pos.tag != "RB" && token.pos.parent != "adjective" && token.pos.parent != "value") {
			token.pos = parts_of_speech['JJ']
			token.pos_reason = "copula-adjective"
		}
		//copula, adverb, verb -> copula adverb adjective -> is very lkjsdf
		if (last && next && last.pos.tag == "CP" && token.pos.tag == "RB" && next.pos.parent == "verb") {
			sentence.tokens[i + 1].pos = parts_of_speech['JJ']
			sentence.tokens[i + 1].pos_reason = "copula-adverb-adjective"
		}
		// the city [verb] him.
		if(next && next.pos.tag=="PRP" && token.pos.parent=="noun" && !token.punctuated){
			token.pos=parts_of_speech['VB']
			token.pos_reason = "before a [him|her|it]"
		}

		//the misled worker -> misled is an adjective, not vb
		if (last && next && last.pos.tag == "DT" && next.pos.parent == "noun" && token.pos.parent == "verb" ) {
			token.pos = parts_of_speech['JJ']
			token.pos_reason = "determiner-adjective-noun"
		}


		return token
	}

	//add a 'quiet' token for contractions so we can represent their grammar
	var handle_contractions = function(arr) {
		var contractions = {
			"i'd": ["i", "would"],
			"she'd": ["she", "would"],
			"he'd": ["he", "would"],
			"they'd": ["they", "would"],
			"we'd": ["we", "would"],
			"i'll": ["i", "will"],
			"she'll": ["she", "will"],
			"he'll": ["he", "will"],
			"they'll": ["they", "will"],
			"we'll": ["we", "will"],
			"i've": ["i", "have"],
			"they've": ["they", "have"],
			"we've": ["we", "have"],
			"should've": ["should", "have"],
			"would've": ["would", "have"],
			"could've": ["could", "have"],
			"must've": ["must", "have"],
			"i'm": ["i", "am"],
			"he's": ["he", "is"],
			"she's": ["she", "is"],
			"we're": ["we", "are"],
			"they're": ["they", "are"],
			"cannot": ["can", "not"],
		}
		for (var i = 0; i < arr.length; i++) {
			if (contractions[arr[i].normalised || null]) {
				var before = arr.slice(0, i)
				var after = arr.slice(i + 1, arr.length)
				var fix = [{
					text: "",
					normalised: contractions[arr[i].normalised][0],
					start: arr[i].start
				}, {
					text: arr[i].text,
					normalised: contractions[arr[i].normalised][1],
					start: undefined
				}]
				arr = before.concat(fix)
				arr = arr.concat(after)
				return handle_contractions(arr)
			}
		}
		return arr
	}


	////////////
	//////////
	var main = function(text, options) {
		options = options || {}

		var sentences = tokenize(text);


		sentences.forEach(function(sentence) {

		  //first, lets handle the first-word capitalisation issue..
		  //be sure we don't over-classify it as a noun
		  var first=sentence.tokens[0]
		  var l=first.normalised.length
		  // if(first && first.special_capitalised && !(lexicon_pass[first.normalised] || wordnet_suffixes[first.normalised.slice(l-4, l)]) ){
		  // 	sentence.tokens[0].special_capitalised=false
		  // }

			//smart handling of contractions
			sentence.tokens = handle_contractions(sentence.tokens)

			//first pass, word-level clues
			sentence.tokens = sentence.tokens.map(function(token) {


				//it has a capital and isn't first word
				if (token.special_capitalised && !lexicon_pass[first.normalised]) {
					token.pos = parts_of_speech['NN']
					token.pos_reason = "capitalised"
					return token
				}

				//known words list
				var lex = lexicon_pass(token.normalised)
				if (lex) {
					token.pos = lex;
					token.pos_reason = "lexicon"
					return token
				}
				//handle punctuation like ' -- '
				if(!token.normalised){
					token.pos= parts_of_speech['UH']
					token.pos_reason= "wordless_string"
					return token
				}

				// suffix pos signals from wordnet
				var len = token.normalised.length
				if (len > 4) {
					var suffix = token.normalised.substr(len - 4, len - 1)
					if (wordnet_suffixes[suffix]) {
						token.pos = parts_of_speech[wordnet_suffixes[suffix]]
						token.pos_reason = "wordnet suffix"
						return token
					}
				}

				// suffix regexes for words
				var r = rules_pass(token.normalised);
				if (r) {
					token.pos = r;
					token.pos_reason = "regex suffix"
					return token
				}

				//see if it's a number
				if (parseFloat(token.normalised)) {
					token.pos = parts_of_speech['CD']
					token.pos_reason = "parsefloat"
					return token
				}

				return token
			})

			//second pass, wrangle results a bit
			sentence.tokens = sentence.tokens.map(function(token, i) {
				var next = sentence.tokens[i + 1]
				var prev = sentence.tokens[i - 1]
				//set ambiguous 'ed' endings as either verb/adjective
				if (token.normalised.match(/.ed$/)) {
					token.pos = parts_of_speech['VB']
					token.pos_reason = "ed"
				}
				return token
			})

			//third pass, seek verb or noun phrases after their signals
			var need = null
			var reason = ''
			sentence.tokens = sentence.tokens.map(function(token, i) {
				var next = sentence.tokens[i + 1]
				var prev = sentence.tokens[i - 1]
				if (token.pos) {
					//suggest noun after some determiners (a|the), posessive pronouns (her|my|its)
					if (token.normalised=="the" || token.normalised=="a" || token.normalised=="an" || token.pos.tag == "PP") {
						need = 'noun'
						reason = token.pos.name
						return token //proceed
					}
					//suggest verb after personal pronouns (he|she|they), modal verbs (would|could|should)
					if (token.pos.tag == "PRP" || token.pos.tag == "MD") {
						need = 'verb'
						reason = token.pos.name
						return token //proceed
					}

				}
				//satisfy need on a conflict, and fix a likely error
				if(token.pos){
					if(need=="verb" && token.pos.parent=="noun" && (!next || (next.pos && next.pos.parent!="noun")) ){
						if(!next || !next.pos || next.pos.parent!=need){//ensure need not satisfied on the next one
							token.pos = parts_of_speech['VB']
							token.pos_reason = "signal from " + reason
							need=null
						}
					}
					if(need=="noun" && token.pos.parent=="verb" && (!next || (next.pos && next.pos.parent!="verb")) ){
						if(!next || !next.pos || next.pos.parent!=need){//ensure need not satisfied on the next one
						  token.pos = parts_of_speech["NN"]
						  token.pos_reason = "signal from " + reason
						  need=null
					  }
					}
				}
				//satisfy need with an unknown pos
				if (need && !token.pos ) {
					if(!next || !next.pos || next.pos.parent!=need){//ensure need not satisfied on the next one
			    	token.pos = parts_of_speech[need]
			    	token.pos_reason = "signal from " + reason
				    need= null
				  }
				}
				if (need == 'verb' && token.pos && token.pos.parent == 'verb') {
					need = null
				}
				if (need == 'noun' && token.pos && token.pos.parent == 'noun') {
					need = null
				}
				return token
			})

			//third pass, identify missing clauses, fallback to noun
			var has = {}
			sentence.tokens.forEach(function(token) {
				if (token.pos) {
					has[token.pos.parent] = true
				}
			})
			sentence.tokens = sentence.tokens.map(function(token, i) {
				if (!token.pos) {
					//if there is no verb in the sentence, and there needs to be.
					if (has['adjective'] && has['noun'] && !has['verb']) {
						token.pos = parts_of_speech['VB']
						token.pos_reason = "need one verb"
						has['verb'] = true
						return token
					}

					//fallback to a noun
					token.pos = parts_of_speech['NN']
					token.pos_reason = "noun fallback"
				}
				return token
			})

			//fourth pass, error correction
			sentence.tokens = sentence.tokens.map(function(token, i) {
				return fourth_pass(token, i, sentence)
			})
			//run the fourth-pass again!
			sentence.tokens = sentence.tokens.map(function(token, i) {
				return fourth_pass(token, i, sentence)
			})

		})

		//combine neighbours
		if (!options.dont_combine) {
			sentences = sentences.map(function(s) {
				return combine_tags(s)
			})
		}

		//add analysis on each token
		sentences = sentences.map(function(s) {
			s.tokens = s.tokens.map(function(token, i) {
				var last_token = s.tokens[i - 1] || null
				var next_token = s.tokens[i + 1] || null
				token.analysis = parents[token.pos.parent](token.normalised, next_token, last_token, token)
				//change to the more accurate version of the pos
				if (token.analysis.which && (token.pos.parent=="noun"||token.pos.parent=="adjective")) {
					// token.pos = token.analysis.which
				}
				return token
			})
			return s
		})

		//make them Sentence objects
		sentences= sentences.map(function(s) {
			var sentence=new Sentence(s.tokens)
			sentence.type=s.type
			return sentence
		})
		//return a Section object, with its methods
		return new Section(sentences)

	}


	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main
})()





	function render(arr) {
		arr.forEach(function(sentence) {
			sentence.tokens.forEach(function(token) {
				console.log(token.normalised + "   " + (token.pos || {}).tag + '   (' + token.pos_reason + ')')
			})
		})
	}

	function analysis(arr) {
		arr.forEach(function(sentence) {
			sentence.tokens.forEach(function(token) {
				console.log(token.normalised + "   " + token.pos.tag + "  " + JSON.stringify(token.analysis))
			})
		})
	}

//fixed////
	// fun = pos("Geroge Clooney walked, quietly into a bank. It was cold.")
	// fun = pos("Geroge Clooney is cool.")
	// fun = pos("i paid five fifty") //combine numbers
	// fun = pos("he was a gorky asdf") //second pass signal
	// fun = pos("Joe quiitly alks the asdf") //"need one verb"
	// fun = pos("joe is fun and quickly blalks") //after adverb
	// fun = pos("he went on the walk") //determiner-verb
	// fun = pos("he is very walk") //copula-adverb-adjective
	// fun = pos("he is very lkajsdf") //two error-corrections (copula-adverb-adjective)
	// fun = pos("joe is real pretty") //consecutive adjectives to adverb
	// fun = pos("joe is real, pretty") //don't combine over a comma
	// fun = pos("walk should walk") //before a modal
	// fun = pos("joe is 9") //number

	//contractions
	// fun = pos("atleast i'm better than geroge clooney")//i'm
	// fun = pos("i bet they'd blalk") //contraction
	// fun = pos("i'm the best") //contraction
	// fun = pos("i'd have said he'd go") //double contractions
	// fun = pos("also is trying to combine their latest") //
	// fun = pos("i agree with tom hanks and nancy kerrigan") //
	// fun = pos("joe walks quickly to the park") //
	// fun = pos("joe will walk to the park") //
	// fun = pos("He has also produced a documentary") //
	// fun = pos("She subsequently married her fourth husband, Jack Bond, a hairdresser; the marriage ended in 1994.") //
	// fun = pos("joe will not walk")[0].tokens //
	// fun = pos("joe won't walk")[0].tokens //
	// fun = pos("joe is not swimming to the bank")[0].tokens //
	// fun = pos("it was one hundred and fifty five thousand people") //combine over and
	// fun = pos("the toronto international festival") //combine over and
	// fun = pos("they were even weaker he said") //better adjectives
	// fun = pos("new") //better adjectives
	// fun = pos("That malignant desire is in the very heart of those who share (this order's) benefits.", {}) //punctuation bug
	// fun = pos("He’s like his character Oishi.", {}) //dont combine non-capitals with capitals
	// fun = pos("one which is justly measured", {}) //dont' overwrite existing lexicon words in conjugation
	// fun = pos("to that which - it is", {}) //handle wordless strings
	// fun = pos("Robert Tucker for one has rightly emphasized", {}) //combine capitals at start
	// fun = pos(" the libertarian thought of The Enlightenment.", {}) //precedence to capital signal
	// fun = pos("he said YOU ARE VERY NICE then left", {}) //handle all-caps
	// fun = pos("he presents an anarchist vision that is appropriate", {}) //
	// fun = pos("The latter can face any visible antagonism.", {}) //
	// fun = pos("he was by far the worst", {}) //support pos for multiples
	// fun = pos("in the United States of America", {}) //combine captial of capital
	// fun = pos("the Phantom of the Opera", {}) //two combines
	// fun = pos("the school asdf him", {}) //before him|her"it
	// fun = pos("the disgruntled worker", {}) //
	// fun = pos("joe carter doesn't play?", {}) //
	// fun = pos("now president of germany", {}) //

//not fixed:
	// fun = pos("Joe would alks the asdf") //"second pass modal"
	// fun = pos("he blalks the asdf") //"second_pass signal from PRP"
	// fun = pos("He does not perform it with truly human energies", {}) //issue with needs model
	// fun = pos("They’re taking risks", {}) //issue with needs model


// s="this position is in Wilhelm Von Humboldt's"
// s='the understanding through spontaneous action, in the following way: '
// s='a well trained parrot'
// s="How do you wear your swords?"
// s='the shadow of war ("nuage de la guerre"'
// s=" a more-than-real death"
	// s="all that violence brewing around the world"
// var s="Sleeping in their suburbs, reading"
// var fun = pos(s, {}) //

	// console.log(fun.sentences[0].tokens)
	// render(fun.sentences)


	//  __ above[IN] -> noun?

//just a wrapper for text -> entities
//most of this logic is in ./parents/noun
var spot = (function() {

	if (typeof module !== "undefined" && module.exports) {
		pos = require("./pos");
	}

	var main = function(text, options) {
		options = options || {}
		var sentences = pos(text, options).sentences
		return sentences.reduce(function(arr,s){
			return arr.concat(s.entities(options))
		},[])
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = main;
	}
	return main
})()

// pos = require("./pos");
// var spots = pos("Tony Hawk walked to Toronto. Germany is in Europe.").entities()
// var spots = spot("tony hawk walked to toronto. He is a singer in the band AFI.")
// var spots = spot("The third, which did happen, as a dissuasive Cold War, ended communism.")
// var spots = spot("mike myers and nancy kerrigan")
// console.log(spots.map(function(s){return s.normalised}))


// if we're server-side, grab files, otherwise assume they're prepended already
if (typeof module !== "undefined" && module.exports) {

  var parents = require("./src/parents/parents")

  var sentence_parser = require('./src/methods/tokenization/sentence').sentences;
  var tokenize = require('./src/methods/tokenization/tokenize').tokenize;
  var ngram = require('./src/methods/tokenization/ngram').ngram;
  //tokenize
  var normalize = require('./src/methods/transliteration/unicode_normalisation')
  var syllables = require('./src/methods/syllables/syllable');
  //localization
  var l = require('./src/methods/localization/britishize')
  var americanize = l.americanize;
  var britishize = l.britishize;
  //part of speech tagging
  var pos = require('./src/pos');
  //named_entity_recognition
  var spot = require('./src/spot');
}

///
//footer
//
var nlp = {

  noun: parents.noun,
  adjective: parents.adjective,
  verb: parents.verb,
  adverb: parents.adverb,
  value: parents.value,

  sentences: sentence_parser,
  ngram: ngram,
  tokenize: tokenize,
  americanize: americanize,
  britishize: britishize,
  syllables: syllables,
  normalize: normalize.normalize,
  denormalize: normalize.denormalize,
  pos: pos,
  spot: spot,
  // tests: tests,
}

//export it for server-side
if (typeof module !== "undefined" && module.exports) {
  module.exports = nlp
}

	///
	//footer
	//
  return nlp
})()