/**
 * Levenshtein measures of the similarity between two strings, which we will refer to as the source string (s)
 * and the target string (t). The distance is the number of deletions, insertions, or substitutions required
 * to transform s into t.
 * For example:
 *  * If s is "test" and t is "test", then LD(s,t) = 0, because no transformations are needed. The strings are already identical.
 *  * If s is "test" and t is "tent", then LD(s,t) = 1, because one substitution (change "s" to "n") is sufficient to transform s into t. 
 * 
 * @param str1 String the first string.
 * @param str2 String the second string.
 * @param [options] Additional options.
 * @param [options.useCollator] Use `Intl.Collator` for locale-sensitive string comparison.
 */
function Levenshtein(str1, str2, options){
    
  this.str1 = str1;
  this.str2 = str2;
  this.options = options;

  // arrays to re-use
  this.prevRow = [];
  this.str2Char = [];

  try {
      this.collator = (typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined") ? Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (err){
      console.log("Collator could not be initialized and wouldn't be used");
  }

  this.str1Len = this.str1.length;
  this.str2Len = this.str2.length;
}

/**
* Calculate levenshtein distance of the two strings.
* @return Integer the levenshtein distance (0 and above).
*/
Levenshtein.prototype.distance = function(){
    var useCollator = (this.options && collator && this.options.useCollator);

    // base cases
    if (this.str1Len === 0) return this.str2Len;
    if (this.str2Len === 0) return this.str1Len;

    // two rows
    var curCol, nextCol, i, j, tmp;

    // initialise previous row
    for (i=0; i < this.str2Len; ++i) {
        this.prevRow[i] = i;
        this.str2Char[i] = this.str2.charCodeAt(i);
    }
    this.prevRow[this.str2Len] = this.str2Len;

  var strCmp;
  if (useCollator) {
      // calculate current row distance from previous row using collator
      for (i = 0; i < this.str1Len; ++i) {
          nextCol = i + 1;

          for (j = 0; j < this.str2Len; ++j) {
              curCol = nextCol;

              // substution
              strCmp = 0 === collator.compare(this.str1.charAt(i), String.fromCharCode(this.str2Char[j]));
              nextCol = this.prevRow[j] + (strCmp ? 0 : 1);

              // insertion
              tmp = curCol + 1;
              if (nextCol > tmp) {
                nextCol = tmp;
              }
              // deletion
              tmp = this.prevRow[j + 1] + 1;
              if (nextCol > tmp) {
                nextCol = tmp;
              }

              // copy current col value into previous (in preparation for next iteration)
              this.prevRow[j] = curCol;
          }

          // copy last col value into previous (in preparation for next iteration)
          this.prevRow[j] = nextCol;
      }
  } else {
      // calculate current row distance from previous row without collator
      for (i = 0; i < this.str1Len; ++i) {
          nextCol = i + 1;

          for (j = 0; j < this.str2Len; ++j) {
              curCol = nextCol;

              // substution
              strCmp = this.str1.charCodeAt(i) === this.str2Char[j];
              nextCol = this.prevRow[j] + (strCmp ? 0 : 1);

              // insertion
              tmp = curCol + 1;
              if (nextCol > tmp) {
                  nextCol = tmp;
              }
              // deletion
              tmp = this.prevRow[j + 1] + 1;
              if (nextCol > tmp) {
                  nextCol = tmp;
              }

              // copy current col value into previous (in preparation for next iteration)
              this.prevRow[j] = curCol;
          }

          // copy last col value into previous (in preparation for next iteration)
          this.prevRow[j] = nextCol;
      }
  }
  return nextCol;
}

/**
* Calculate ratio of levenshtein distance.
* @return Integer ration of the levenshtein distance (0 and above).
*/
Levenshtein.prototype.ratio = function(){
  let lensum = this.str1Len + this.str2Len;
  let ldist = this.distance();

  return (lensum - ldist) / lensum;
}

module.exports = Levenshtein;