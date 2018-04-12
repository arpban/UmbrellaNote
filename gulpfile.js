const gulp = require('gulp');
const gulpsass = require('gulp-sass');
const babel = require('gulp-babel');

gulp.task('styles', ()=>{
	return gulp.src([
		'src/**/*.scss'
	])
	.pipe(gulpsass({
		precision: 10
	}))
	.pipe(gulp.dest('app'));
});

gulp.task('scripts', ()=>{
	return gulp.src([
		'src/**/*.js'
	])
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(gulp.dest('app'));
})

gulp.task('default', ['styles','scripts'], ()=>{
	gulp.watch(['src/**/*.scss'], ['styles']);
	gulp.watch(['src/**/*.js'], ['scripts']);
});
