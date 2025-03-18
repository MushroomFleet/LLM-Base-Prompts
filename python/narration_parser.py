We will create a new python script named "narration_parser.py" which is designed to read a page from a story (example provided for testing and evaluation of the task) and then reformatting it into a "narration list format":

do not change the text in any way

we can use " as a delimiter to break up the text

text wrapped inside " is speech, which will be skipped

write out text on a single line until you reach a " symbol

skip the speech until another " symbol is detected

continue copying the text to a new line

repeat the task skipping speech wrapped in " 

use a new line for each remaining segment of text

task is complete when document end is reached

an example story page "page0_enhanced.txt" is attached.

in this way we can convert a page from a story into a narration format, using a new line each time speech is detected, by skipping the speech. we can use the first " to detect speech and the second " to resume copying, until the page is processed.
