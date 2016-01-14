;;; org-site-config.el --- site config template for org-site

;; Copyright (C) 2013 Xiao Hanyu

;; Author: Xiao Hanyu <xiaohanyu1988@gmail.com>
;; Version: 0.01
;; Keywords: org-mode, site-generator
;; URL: http://github.com/xiaohanyu/org-site

;; This file is not part of GNU Emacs.

;; This program is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;; This file defines a basic configuration template for a org-site project. Each
;; org-site project should contains this file. When you create a new org-site
;; project using `org-site-new-project', this file will be copied to that
;; org-site project's directory. When you load a org-site project using
;; `org-site-load-project', this file will be loaded by elisp to make org-site
;; know necesary information of the current project.

;;; Code:

;;; basic site settings
(defconst org-site-title "Org-Site"
  "Title for your org-site.")

(defconst org-site-url "http://incandescentman.github.io/org-site"
  "Url of your org-site.

This variable is very important to your org-site. It is the base url of all your
org-site html links. If you want to preview in localhost, just set it with
localhost, if you want to publish your org-site to public, then keep consistency
with your real site url.")

(defconst org-site-theme "bootstrap"
  "Theme for your org-site.")

  ;;; personal information
(defconst org-site-author-name "Peter Salazar"
  "Author name of the site.")

(defconst org-site-author-email "org-site@org-site.com"
  "Author email.")

;;; meta info of post
;; meta info contains thing like post date, author,category, etc.
(defconst org-site-enable-meta-info nil
  "Enable meta info or not.")

;;; toc of post
(defconst org-site-enable-toc nil
  "Enable toc(Table Of Contents) or not.")

;;; google custom search
(defconst org-site-enable-google-search nil
  "Enable google custom search or not.")

;;; comment system settings
(defconst org-site-enable-comment nil
  "Enable disqus comment or not.")

;; static site need extra third comment system
;; currently, org-site only support disqus
(defconst org-site-disqus-shortname "org-site"
  "disqus-shortname for your org-site.")

;;; org-publish settings
(defconst org-site-html-publish-dir "/Users/jay/Dropbox/github/incandescentman.github.io/org-site/"
  "Publishing directory for html files.

If set to nil, org-site will publish files to a \"publish\" sub directory
under `org-site-project-directory'.")

;;; debug mode support
(defconst org-site-debug t
  "Set org-site in debug state, which means org-site will keep the
auto-generated index org files after publishing.")
;;; org-site-config.el ends here
