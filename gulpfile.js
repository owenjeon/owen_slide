var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var path = {
    js : 'public/js/dev/',
    style : 'public/style/sass/'
};

var files = {
    js : [path.js+'owen_slide.js']
};

gulp.task('minify-js',function(){
    return gulp.src(files.js)
        .pipe(uglify())
        .pipe(concat('owen_slide.min.js'))
        .pipe(gulp.dest('public/js/dist'));
});

gulp.task('convert-sass',function(){
    return gulp.src([path.style+'*.scss'])
        .pipe(sass({outputStyle : 'compact'}).on('error', sass.logError))
        .pipe(gulp.dest('public/style/css'));
});


gulp.task('watch',['minify-js', 'convert-sass'], function(){
    gulp.watch(path.js+'*.js', ['minify-js']);
    gulp.watch(path.style+'*.scss', ['convert-sass']);
});

gulp.task('default',['watch']);
