bundle exec jekyll clean
rm -rf docs/*
bundle exec jekyll build
mv  _site/* docs/
rm -rf docs/img_orig
bundle exec jekyll clean
