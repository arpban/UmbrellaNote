const gulp = require('gulp');
const gulpsass = require('gulp-sass');

gulp.task('styles', ()=>{
	return gulp.src([
		'src/**/*.scss'
	])
	.pipe(gulpsass({
		precision: 10
	}))
	.pipe(gulp.dest('src'));
});

gulp.task('default', ['styles'], ()=>{
	gulp.watch(['src/**/*.scss'], ['styles']);
});
